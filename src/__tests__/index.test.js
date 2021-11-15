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

  let token;
  let testUserId;
  
  const validCredentials = {
    email: "test@strive.com",
    password: "1234"
  }

  it("should test post request for /users/account endpoint ", async () => {
    const response = await request.post("/users/account").send({
      username: "testUser",
      email: "test@strive.com",
      password: "1234",
    });
    expect(response.status).toBe(201);
    token = response.body.accessToken;
    testUserId = response.body._id;
    expect(response.body).toBe({
      user: {
        username: "testUser",
        email: "test@strive.com",
        avatar: "",
        _id: testUserId,
        token: token,
      },
      accessToken: token,
    });
  });

  
  it("should test endpoint", async () => {
    const response = await request.get("/users?username=testUser");
    expect(response.status).toBe(200);
    expect(response.body).toBe([
      {
        _id: testUserId,
        username: "testUser",
        email: "test@strive.com",
        avatar: ""
      }
    ]
    )
  });
  
  it("should test endpoint", async () => {
    const response = await request.get("/users?email=test@strive.com");
    expect(response.status).toBe(200);
    expect(response.body).toBe([
      {
        _id: testUserId,
        username: "testUser",
        email: "test@strive.com",
        avatar: ""
      }
    ]
    )
  });
  
  it("should test endpoint", async () => {
    const response = await request.get("/users/me").send({accessToken: token})
    expect(response.status).toBe(200);
    expect(response.body).toBe(
      {
        _id: testUserId,
        username: "testUser",
        email: "test@strive.com",
        avatar: ""
      }
    )
  });


  it("should test endpoint", async () => {
    const response = await request.put("/users/me").send({user: {username: "someOtherGuy"}, accessToken: token} )
    expect(response.status).toBe(200);
    expect(response.body).toBe(
      {
        _id: testUserId,
        username: "someOtherGuy",
        email: "test@strive.com",
        avatar: ""
      }
    )
  });


  it("should test endpoint for user/me/avatar", async () => {
    const response = await request.post("/users/me/avatar").send({user: {avatar: "123123"},  accessToken: token});
    expect(response.status).toBe(200);
    expect(response.body).toBe(
      {
        _id: testUserId,
        username: "someOtherGuy",
        email: "test@strive.com",
        avatar: "123123"
      }
    )
  })


  it("should test endpoint get/users/:id", async () => {
    const response = await request.get(`/users/${testUserId}`);
    expect(response.status).toBe(200);
    expect(response.body).toBe(
      {
        _id: testUserId,
        username: "someOtherGuy",
        email: "test@strive.com",
        avatar: "123123"
      }
    )
  });


  // it("should test endpoint users/session", async () => {
  //   const response = await request.get("/users/session").send(validCredentials)
  //   expect(response.status).toBe(200);

    
  // });
  
  it("should test endpoint users/session", async () => {
    const response = await request.get("/users/session").send(validCredentials)
    expect(response.status).toBe(200);
    expect(response.body.accessToken === token).toBe(false)
    
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
