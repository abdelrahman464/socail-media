const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userShcema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName required"],
    },
    lastName: { type: String, required: [true, "lastName required"] },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    profileImg: String,
    coverImgs: [String],
    google: {
      id: String,
      email: String,
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.isOAuthUser;
        },
        "password required",
      ],
      minlength: [8, "too short Password"],
    },
    isOAuthUser: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    lockedProfile: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    headline: {
      type: String,
      default: undefined,
    },
    summary: {
      type: String,
      default: undefined,
    },
    skills: [
      {
        type: String,
      },
    ],
    experience: [
      {
        title: {
          type: String,
          required: true,
          default: undefined,
        },
        company: {
          type: String,
          required: true,
          default: undefined,
        },
        location: {
          type: String,
          required: true,
          default: undefined,
        },
        startDate: {
          type: Date,
          required: true,
          default: undefined,
        },
        endDate: {
          type: Date,
          default: undefined,
        },
        description: {
          type: String,
          default: undefined,
        },
      },
    ],
    education: [
      {
        school: {
          type: String,
          required: true,
          default: undefined,
        },
        degree: {
          type: String,
          required: true,
          default: undefined,
        },
        fieldOfStudy: {
          type: String,
          required: true,
          default: undefined,
        },
        startDate: {
          type: Date,
          required: true,
          default: undefined,
        },
        endDate: {
          type: Date,
          default: undefined,
        },
        description: {
          type: String,
          default: undefined,
        },
      },
    ],
  },
  { timestamps: true }
);

userShcema.pre("save", async function (next) {
  //if password field is not modified go to next middleware
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const setImageURL = (doc) => {
  //return image base url + iamge name
  if (doc.profileImg) {
    const profileImageUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
    doc.profileImg = profileImageUrl;
  }
  if (doc.coverImgs) {
    const imageListWithUrl = [];
    doc.coverImgs.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/users/${image}`;
      imageListWithUrl.push(imageUrl);
    });
    doc.coverImgs = imageListWithUrl;
  }
};
//after initializ the doc in db
// check if the document contains image
// it work with findOne,findAll,update
userShcema.post("init", (doc) => {
  setImageURL(doc);
});
// it work with create
userShcema.post("save", (doc) => {
  setImageURL(doc);
});

const User = mongoose.model("User", userShcema);
module.exports = User;
