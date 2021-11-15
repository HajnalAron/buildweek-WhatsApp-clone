import supertest from "supertest";
import dotenv from "dotenv";
import mongoose, { connection } from "mongoose";

dotenv.config();

const request = supertest();

describe("Testing the test environment ", () => {
  it("should return true", () => {
    expect(true).toBe(true);
  });
});

describe("Testing the user endpoints", () => {
  beforeAll((done) => {
    mongoose.connect(process.env.MONGO_URL_TEST).then(() => {
      console.log("Connected to test DB");
      done();
    });
  });
  it("should test users endpoint get request", async () => {
    const response = await request.get("");
  });
  it("should test endpoint", async () => {
    const response = await request.get("");
  });
  it("should test endpoint", async () => {
    const response = await request.get("");
  });
  it("should test endpoint", async () => {
    const response = await request.get("");
  });
  it("should test endpoint", async () => {
    const response = await request.get("");
  });
  it("should test endpoint", async () => {
    const response = await request.get("");
  });
  it("should test endpoint", async () => {
    const response = await request.get("");
  });
  it("should test endpoint", async () => {
    const response = await request.get("");
  });
  it("should test endpoint", async () => {
    const response = await request.get("");
  });
  afterAll((done) => {
    mongoose.connection.dropDatabase().then(() => {
      return mongoose.connection.close().then(() => {
        console.log("Database dropped");
        done();
      });
    });
  });
});
