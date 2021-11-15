import supertest from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {app} from "../app.js"


dotenv.config();

const request = supertest(app);

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
    // 
  
    
    expect(response.status).toBe(200);
    token = response.body.accessToken;
    testUserId = response.body.user._id;
    // console.log("USERID", testUserId)
    expect(response.body).toStrictEqual({
      user: {
        username: "testUser",
        email: "test@strive.com",
        _id: testUserId
      },
      accessToken: token,
    });
  });

  
   it("should test endpoint for username", async () => {
     const response = await request.get("/users?username=testUser");
     expect(response.status).toBe(200);
     expect(response.body).toStrictEqual([
       {
         _id: testUserId,
         username: "testUser",
         email: "test@strive.com"
       }
     ]
     )
   });
  
   it("should test endpoint for email", async () => {
     const response = await request.get("/users?email=test@strive.com");
     expect(response.status).toBe(200);
     expect(response.body).toStrictEqual([
       {
         _id: testUserId,
         username: "testUser",
         email: "test@strive.com"
       }
     ]
     )
   });
  
  it("should test endpoint for single -ME 👀", async () => {
    const response = await request.get("/users/me").send({accessToken: token})
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(
      {
        _id: testUserId,
        username: "testUser",
        email: "test@strive.com"
        
      }
    )
  });


  it("should test endpoint for changing user name ", async () => {
    const response = await request.put("/users/me").send({newUserData: {username: "someOtherGuy"},
     accessToken: token} )
    console.log(token) 
    expect(response.status).toBe(200);
    
    expect(response.body).toStrictEqual(
      {
        _id: testUserId,
        username: "someOtherGuy",
        email: "test@strive.com"
        
      }
    )
  });


   it("should test endpoint for user/me/avatar", async () => {
    const response = await request.post("/users/me/avatar").send({ newUserData:{ avatar: "123123"},
      accessToken: token});
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(
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
    expect(response.body).toStrictEqual(
      {
        _id: testUserId,
        username: "someOtherGuy",
        email: "test@strive.com",
        avatar: "123123"
      }
    )
  });


  

    
  
  
  it("should test endpoint users/session", async () => {
    const response = await request.post("/users/session").send(validCredentials)
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
