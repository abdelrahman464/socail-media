const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userShcema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName required"],
    },
    lastName: String,
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
    },
    phone: String,
    profileImg: String,
    coverImgs: [String],
    password: {
      type: String,
      minlength: [8, "too short Password"],
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
    active: {
      type: Boolean,
      default: true,
    },
    headline: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    skills: [
      {
        type: String,
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Jobs",
      },
    ],
    experience: [
      {
        title: {
          type: String,
          required: true,
        },
        company: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],
    education: [
      {
        school: {
          type: String,
          required: true,
        },
        degree: {
          type: String,
          required: true,
        },
        fieldOfStudy: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    connectionRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FriendRequest",
      },
    ],
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    groupRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupRequest",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
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
