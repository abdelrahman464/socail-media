const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const factory = require("./handllerFactory");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

//upload user image
exports.uploadUserImages = uploadMixOfImages([
  {
    name: "profileImg",
    maxCount: 1,
  },
  {
    name: "coverImgs",
    maxCount: 3,
  },
]);
//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // Image processing for profileImg
  if (req.files.profileImg) {
    const profileImgFileName = `user-${uuidv4()}-${Date.now()}-profile.jpeg`;

    await sharp(req.files.profileImg[0].buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${profileImgFileName}`);

    // Save image into our db
    req.body.profileImg = profileImgFileName;
  }
  // Image processing for imageCover
  if (req.files.coverImgs) {
    req.body.coverImgs = [];
    await Promise.all(
      req.files.coverImgs.map(async (img, index) => {
        const imageName = `user-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/users/${imageName}`);

        // Save image into our db
        req.body.coverImgs.push(imageName);
      })
    );
  }

  next();
});
//@desc get list of user
//@route GET /api/v1/users
//@access private
exports.getUsers = factory.getALl(User);
//@desc get specific User by id
//@route GET /api/v1/User/:id
//@access private
exports.getUser = factory.getOne(User);
//@desc create user
//@route POST /api/v1/users
//@access private
exports.createUser = factory.createOne(User);
//@desc update specific user
//@route PUT /api/v1/user/:id
//@access private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      profileImg: req.body.profileImg,
      coverImgs: req.body.coverImgs,
      phone: req.body.phone,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`User not found`, 404));
  }

  res.status(200).json({ user });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`User not found`, 404));
  }
  res.status(200).json({ data: user });
});
//@desc delete User
//@route DELETE /api/v1/user/:id
//@access private
exports.deleteUser = factory.deleteOne(User);
//@desc get logged user data
//@route GET /api/v1/user/getMe
//@access private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  // i will set the req,pararms.id because i will go to the next middleware =>>> (getUser)
  req.params.id = req.user._id;
  next();
});
//@desc update logged user password
//@route PUT /api/v1/user/changeMyPassword
//@access private/protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  //update user password passed on user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  //genrate token
  const token = generateToken(req.user._id);

  res.status(200).json({ data: user, token });
});
//@desc update logged user data without updating password or role
//@route PUT /api/v1/user/changeMyData
//@access private/protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      profileImg: req.body.profileImg,
      coverImgs: req.body.coverImgs,
      phone: req.body.phone,
    },
    {
      new: true,
    }
  );
  res.status(200).json({ data: user });
});
//@desc deactivate logged user
//@route DELETE /api/v1/user/deleteMe
//@access private/protect
exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).send();
});
//@desc activate logged user
//@route PUT /api/v1/user/activeMe
//@access private/protect
exports.activeLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: true });
  res.status(201).json({ data: "success" });
});
