var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  deviceUserSecret: {
    type: String
  },
  devices: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }]
  }
});

UserSchema.pre("save", function (next) {
  var user = this;

  if (this.isNew) {
    user.deviceUserSecret =
      "A RANDOM GENERATED STRING HERE, TO SEND FROM THE ARDUINOS WHEN THEY ARE BEING SET UP (INSTEAD OF SONOS USERNAME)";
  }
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model("User", UserSchema);
