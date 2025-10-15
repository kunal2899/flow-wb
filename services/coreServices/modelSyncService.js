const { flatten } = require("lodash");
const sequelize = require("../../configs/dbConfig");
const models = require("../../models");
require("dotenv").config({ quiet: true });

const syncModels = async (options = {}) => {
  try {
    const { force = false, alter = false } = options;
    const syncOptions = force ? { force: true } : alter ? { alter: true } : {};
    
    console.log(`Syncing models with options:`, syncOptions);
    
    // Sync order
    const syncLevels = [
      [
        // 'user',
        // 'workflow', 
        // 'endpoint',
        // 'node'
      ],
      [
        // 'userWorkflow',    // depends on User, Workflow
        // 'userEndpoint',    // depends on User, Endpoint
        // 'workflowNode'     // depends on Workflow, Node
      ],
      [
        // 'userWorkflowTrigger',  // depends on UserWorkflow
        // 'actionNodeConfig',      // depends on WorkflowNode, UserEndpoint
        // 'delayNodeConfig',       // depends on WorkflowNode
        // 'rule'                   // depends on WorkflowNode
      ],
      [
        'workflowExecution',     // depends on UserWorkflowTriggers, UserWorkflow
        // 'workflowNodeConnection' // depends on WorkflowNode, ConditionNodeConfig
      ],
      [
        // 'workflowNodeExecution'  // depends on WorkflowExecution, WorkflowNode
      ],
    ];
    
    for (let i = 0; i < syncLevels.length; i++) {
      const levelModels = syncLevels[i];
      console.log(`Syncing Level ${i + 1} models: ${levelModels.join(', ')}`);
      
      for (const modelName of levelModels) {
        if (models[modelName]) {
          await models[modelName].sync(syncOptions);
          const action = force ? 'recreated' : alter ? 'altered' : 'synced';
          console.log(`✅ ${modelName} table ${action}`);
        } else {
          console.warn(`⚠️  Model ${modelName} not found`);
        }
      }
    }

    // if (flatten(syncLevels).length === 0) {
    //   sequelize.sync();
    // }
    
    console.log('All models synced successfully in dependency order!');
  } catch (error) {
    console.error('Error syncing tables - ', error);
  }
}


if (require.main === module) {
  (async() => {
    const args = process.argv.slice(2);
    const options = {};
    
    if (args.includes('--force')) {
      options.force = true;
      console.log('WARNING: Using --force will DROP and RECREATE all tables!');
    } else if (args.includes('--alter')) {
      options.alter = true;
      console.log('Using --alter to modify existing tables safely');
    } else {
      console.log('Safe sync mode - only creates missing tables');
    }
    
    await syncModels(options);
  })();
}
