const { isNil, isString } = require('lodash');
const { getRedisConnection } = require('../../configs/redisConfig');

class RedisCacheService {
  constructor() {
    this.client = null;
  }

  getClient() {
    if (!this.client) {
      this.client = getRedisConnection();
    }
    return this.client;
  }

  /**
   * Set a key-value pair in Redis
   * @param {string} key - The key to set
   * @param {any} value - The value to set (will be JSON stringified)
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<string>} - Redis response
   */
  async set(key, value, ttl = null) {
    try {
      const client = this.getClient();
      const stringValue = isString(value) ? value : JSON.stringify(value);
      if (ttl) {
        return await client.setex(key, ttl, stringValue);
      } else {
        return await client.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get a value from Redis by key
   * @param {string} key - The key to get
   * @param {boolean} parseJson - Whether to parse the value as JSON (default: true)
   * @returns {Promise<any>} - The value or null if not found
   */
  async get(key, parseJson = true) {
    try {
      const client = this.getClient();
      const value = await client.get(key);
      
      if (isNil(value)) return null;
      
      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch (parseError) {
          // If JSON parsing fails, return the raw string
          return value;
        }
      }
      
      return value;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key from Redis
   * @param {string} key - The key to delete
   * @returns {Promise<number>} - Number of keys deleted
   */
  async delete(key) {
    try {
      const client = this.getClient();
      return await client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Delete multiple keys from Redis
   * @param {string[]} keys - Array of keys to delete
   * @returns {Promise<number>} - Number of keys deleted
   */
  async deleteMany(keys) {
    try {
      const client = this.getClient();
      return await client.del(...keys);
    } catch (error) {
      console.error(`Error deleting keys ${keys.join(', ')}:`, error);
      return 0;
    }
  }

  /**
   * Check if a key exists in Redis
   * @param {string} key - The key to check
   * @returns {Promise<boolean>} - True if key exists, false otherwise
   */
  async exists(key) {
    try {
      const client = this.getClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration time for a key
   * @param {string} key - The key to set expiration for
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - True if expiration was set, false otherwise
   */
  async expire(key, ttl) {
    try {
      const client = this.getClient();
      const result = await client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error(`Error setting expiration for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get time to live for a key
   * @param {string} key - The key to get TTL for
   * @returns {Promise<number>} - TTL in seconds (-1 if no expiration, -2 if key doesn't exist)
   */
  async ttl(key) {
    try {
      const client = this.getClient();
      return await client.ttl(key);
    } catch (error) {
      console.error(`Error getting TTL for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Get all keys matching a pattern
   * @param {string} pattern - The pattern to match (e.g., "user:*")
   * @returns {Promise<string[]>} - Array of matching keys
   */
  async keys(pattern) {
    try {
      const client = this.getClient();
      return await client.keys(pattern);
    } catch (error) {
      console.error(`Error getting keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Flush all keys from the current database
   * @returns {Promise<string>} - Redis response
   */
  async flushDb() {
    try {
      const client = this.getClient();
      return await client.flushdb();
    } catch (error) {
      console.error('Error flushing database:', error);
      return null;
    }
  }

  /**
   * Increment a numeric value
   * @param {string} key - The key to increment
   * @param {number} increment - The amount to increment by (default: 1)
   * @returns {Promise<number>} - The new value after increment
   */
  async increment(key, increment = 1) {
    try {
      const client = this.getClient();
      if (increment === 1) {
        return await client.incr(key);
      } else {
        return await client.incrby(key, increment);
      }
    } catch (error) {
      console.error(`Error incrementing key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Decrement a numeric value
   * @param {string} key - The key to decrement
   * @param {number} decrement - The amount to decrement by (default: 1)
   * @returns {Promise<number>} - The new value after decrement
   */
  async decrement(key, decrement = 1) {
    try {
      const client = this.getClient();
      if (decrement === 1) {
        return await client.decr(key);
      } else {
        return await client.decrby(key, decrement);
      }
    } catch (error) {
      console.error(`Error decrementing key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set multiple key-value pairs
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @returns {Promise<string>} - Redis response
   */
  async setMultiple(keyValuePairs) {
    try {
      const client = this.getClient();
      const args = [];
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        args.push(key);
        args.push(isString(value) ? value : JSON.stringify(value));
      }
      
      return await client.mset(...args);
    } catch (error) {
      console.error('Error setting multiple keys:', error);
      return null;
    }
  }

  /**
   * Get multiple values by keys
   * @param {string[]} keys - Array of keys to get
   * @param {boolean} parseJson - Whether to parse values as JSON (default: true)
   * @returns {Promise<any[]>} - Array of values (null for non-existent keys)
   */
  async getMultiple(keys, parseJson = true) {
    try {
      const client = this.getClient();
      const values = await client.mget(...keys);
      
      if (parseJson) {
        return values.map(value => {
          if (isNil(value)) return null;
          try {
            return JSON.parse(value);
          } catch (parseError) {
            return value;
          }
        });
      }
      
      return values;
    } catch (error) {
      console.error(`Error getting multiple keys ${keys.join(', ')}:`, error);
      return [];
    }
  }

  /**
   * Check Redis connection status
   * @returns {boolean} - True if connected, false otherwise
   */
  isClientConnected() {
    return this.client && this.client.status === 'ready';
  }

  /**
   * Ping Redis server
   * @returns {Promise<string>} - "PONG" if successful
   */
  async ping() {
    try {
      const client = this.getClient();
      return await client.ping();
    } catch (error) {
      console.error('Error pinging Redis server:', error);
      return 'PONG';
    }
  }
  
  // List operations

  async pushToList(key, value, direction = 'right') {
    const method = direction === 'left' ? 'lpush' : 'rpush';
    try {
      const client = this.getClient();
      const stringValue = isString(value) ? value : JSON.stringify(value);
      return await client[method](key, stringValue);
    } catch (error) {
      console.error(`Error ${method.toUpperCase()} to list ${key}:`, error);
      return 0;
    }
  }

  async popFromList(key, direction = 'right') {
    const method = direction === 'left' ? 'lpop' : 'rpop';
    try {
      const client = this.getClient();
      const result = await client[method](key);
      return this.safeParse(result);
    } catch (error) {
      console.error(`Error ${method.toUpperCase()} from list ${key}:`, error);
      return null;
    }
  }

  async removeListItem(key, value, count = 0) {
    try {
      const client = this.getClient();
      const stringValue = isString(value) ? value : JSON.stringify(value);
      // count > 0: remove from head, count < 0: remove from tail, count=0: all occurrences
      return await client.lrem(key, count, stringValue);
    } catch (error) {
      console.error(`Error removing item from list ${key}:`, error);
      return 0;
    }
  }

  async getListItems(key, start = 0, end = -1) {
    try {
      const client = this.getClient();
      const results = await client.lrange(key, start, end);
      return results.map(this.safeParse);
    } catch (error) {
      console.error(`Error getting list items for key ${key}:`, error);
      return [];
    }
  }

  async getListLength(key) {
    try {
      const client = this.getClient();
      return await client.llen(key);
    } catch (error) {
      console.error(`Error getting list length for key ${key}:`, error);
      return 0;
    }
  }

  async trimList(key, start, end) {
    try {
      const client = this.getClient();
      await client.ltrim(key, start, end);
      return true;
    } catch (error) {
      console.error(`Error trimming list for key ${key}:`, error);
      return false;
    }
  }

  // Set operations

  async addToSet(key, ...values) {
    try {
      const client = this.getClient();
      const stringValues = values.map(v => (isString(v) ? v : JSON.stringify(v)));
      return await client.sadd(key, ...stringValues);
    } catch (error) {
      console.error(`Error adding to set ${key}:`, error);
      return 0;
    }
  }

  async removeFromSet(key, ...values) {
    try {
      const client = this.getClient();
      const stringValues = values.map(v => (isString(v) ? v : JSON.stringify(v)));
      return await client.srem(key, ...stringValues);
    } catch (error) {
      console.error(`Error removing from set ${key}:`, error);
      return 0;
    }
  }

  async popRandomFromSet(key, count = 1) {
    try {
      const client = this.getClient();
      const result = await client.spop(key, count);
      if (Array.isArray(result)) return result.map(this.safeParse);
      return result ? this.safeParse(result) : null;
    } catch (error) {
      console.error(`Error popping random item from set ${key}:`, error);
      return null;
    }
  }

  async getSetMembers(key) {
    try {
      const client = this.getClient();
      const members = await client.smembers(key);
      return members.map(this.safeParse);
    } catch (error) {
      console.error(`Error getting members for set ${key}:`, error);
      return [];
    }
  }

  async isMemberOfSet(key, value) {
    try {
      const client = this.getClient();
      const stringValue = isString(value) ? value : JSON.stringify(value);
      const exists = await client.sismember(key, stringValue);
      return exists === 1;
    } catch (error) {
      console.error(`Error checking membership for set ${key}:`, error);
      return false;
    }
  }

  async getSetSize(key) {
    try {
      const client = this.getClient();
      return await client.scard(key);
    } catch (error) {
      console.error(`Error getting size for set ${key}:`, error);
      return 0;
    }
  }

  safeParse (value) {
    if (!value) return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}

const redisCacheService = new RedisCacheService();

module.exports = redisCacheService;
