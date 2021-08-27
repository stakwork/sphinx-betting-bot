require("dotenv").config();
import * as redis from "./redis";
import * as client from "./client";

redis.initialize();

client.init();
