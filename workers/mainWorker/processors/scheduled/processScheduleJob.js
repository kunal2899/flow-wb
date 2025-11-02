const { startCase } = require("lodash");
const sequelize = require("@configs/dbConfig");
const executeWorkflow = require("@helpers/executeWorkflow");
const UserWorkflowTrigger = require("@models/UserWorkflowTriggers.model");
const { USER_WORKFLOW_TRIGGER_TYPE } = require("@constants/userWorkflow");

const processScheduleJob = async ({ job, type }) => {
  try {
    console.info(
      `Received ${startCase(type)} job at `,
      new Date().toLocaleString()
    );
    const { triggerId, userWorkflowId } = job.data;
    await sequelize.transaction(async (transaction) => {
      const userWorkflowTrigger = await UserWorkflowTrigger.findOne({
        where: { id: triggerId },
        transaction,
      });
      if (!userWorkflowTrigger) {
        throw new Error("User workflow trigger not found!");
      }
      if (!userWorkflowTrigger.isActive) {
        console.warn("Schedule trigger is currently inactive!");
        await UserWorkflowTrigger.toggleTriggerByType(
          userWorkflowTrigger,
          false
        );
      }
      await userWorkflowTrigger.update(
        {
          lastRunAt: new Date(),
        },
        { transaction }
      );
      // Can remove schedule triggers as they are for one-time only
      if (userWorkflowTrigger.type === USER_WORKFLOW_TRIGGER_TYPE.SCHEDULE) {
        await userWorkflowTrigger.destroy({ transaction });
      }
      await executeWorkflow({ userWorkflowId, triggerId });
    });
    console.log(`${startCase(type)} job processed successfully`);
  } catch (error) {
    console.error("Error in processors.processScheduleJob - ", error);
    throw error;
  }
};

module.exports = processScheduleJob;
