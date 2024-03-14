const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/jwtToken");
const generateRefreshToken = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const validateMongodbId = require("../utils/validateMongodbId");

// UserCtrl-01: Creating a user using post: "/api/user/signup".
const createUser = asyncHandler(async (req, res) => {
  // Extract email from the req body
  const email = req.body.email;
  // Check if the user with the given email already exists
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json({ msg: "New user created", newUser });
  } else {
    throw new Error("User Already Exist!");
  }
});

// UserCtrl-02: Login a user using post: "/api/user/login".
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if the user exist or not
  const findUser = await User.findOne({ email });

  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 48 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      password: findUser?.password,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credintials!");
  }
});

// UserCtrl-03: Admin login using post: "/api/user/admin-login".
const loginAdminCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if the admin exist or not
  const findAdmin = await User.findOne({ email });

  if (findAdmin.role !== "admin") throw new Error("Not Authorized!");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateAdmin = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 48 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      password: findAdmin?.password,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credintials!");
  }
});

// UserCtrl-04: Handle refresh token using get: "/api/user/refresh-token".
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken)
    throw new Error("No refresh token found in cookie!");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No refresh token found or matched!");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token!");
    }
    const acccessToken = generateToken(user?._id);
    res.json({ acccessToken });
  });
});

// UserCtrl-05: logout user using get: "/api/user/logout"
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken)
    throw new Error("No refresh token found in cookie!");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); //Forbidden
  }
  await User.findOneAndUpdate({ refreshToken });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); //Forbidden
});

// UserCtrl-06: Update a user using put: "/api/user/edit-user".
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json({
      msg: "User updated Successfully!",
      updatedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  handleRefreshToken,
  loginAdminCtrl,
  logout,
  updateUser,
};
