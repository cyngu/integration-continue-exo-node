db = db.getSiblingDB("ynov-ci");

db.roles.insertMany([
  {
    name: "admin",
    permissions: ["delete", "read"]
  },
  {
    name: "employee",
    permissions: ["read"]
  }
]);

const adminRole = db.roles.findOne({ name: "admin" });

db.users.insertOne({
  name: "fenoll",
  firstname: "loise",
  email: "loise.fenoll@ynov.com",
  // password: "ANKymoUTFu4rbybmQ9Mt",
  password: "$2y$10$nAu77dNUfmDtWDARTPRESu4jeDzHRVJiQOhBOHo.zQOQs1T9qCXOS", // TODO make a function to hash password
  birthDate: "1990-01-01T00:00:00.000Z",
  city: "Paris",
  zipcode: "75001",
  role: adminRole._id
});