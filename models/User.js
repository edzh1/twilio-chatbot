const uuidv1 = require('uuid/v1');
const db = require('../db');

class User {
  constructor(phone, branch) {
    const newUser = {
      id: uuidv1(),
      phone,
      branch,
      step: 0,
      fullname: '',
      reason: '',
      address: '',
      startDate: new Date(),
    };

    db.get('results')
      .push(newUser)
      .write();

    return newUser;
  }
}

User.get = (phone) => {
  const user = db.get('results')
    .filter({ phone })
    .last()
    .value();

  return user || {};
}

User.update = (user) => {
  return db.get('results')
    .filter({ phone: user.phone })
    .last()
    .assign(user)
    .write()
}

module.exports = User;
