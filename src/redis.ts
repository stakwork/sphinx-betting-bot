import * as redis from "redis";

let client;

export async function initialize() {
  client = redis.createClient(process.env.REDIS_URL);
  if (process.env.FLUSH_ALL === "1") {
    client.flushdb(function (err, succeeded) {
      if (err) console.log("ERROR FLUSHING");
      else console.log("FLUSHED ALL", succeeded); // will be true if successfull
    });
  }
}

export async function get(key: string): Promise<any> {
  return new Promise((resolve) => {
    client.get(key, function (err, res) {
      if (err) {
        resolve(null);
      } else {
        try {
          const data = JSON.parse(res);
          resolve(data);
        } catch (e) {
          resolve(null);
        }
      }
    });
  });
}

export async function set(key: string, value: Object, ttl?: number) {
  const t = ttl || 3600; // one hour
  return new Promise((resolve) => {
    client.set(key, JSON.stringify(value), "EX", t, function (err, res) {
      if (err) {
        resolve(null);
      } else {
        resolve(res);
      }
    });
  });
}

export async function del(key: string) {
  return new Promise((resolve) => {
    client.del(key, function (err, res) {
      if (err) {
        resolve(null);
      } else {
        resolve(res);
      }
    });
  });
}

// function tryRedis() {
//   client.on("error", function (error) {
//     console.error(error);
//   });

//   client.set("key", "value", redis.print);
//   client.get("key", redis.print);
//   client.del("key", redis.print);
//   client.get("key", redis.print);
// }
