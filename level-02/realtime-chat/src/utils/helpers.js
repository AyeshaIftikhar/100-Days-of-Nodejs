exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.formatUserForResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  isOnline: user.isOnline,
  lastSeen: user.lastSeen
});

exports.paginateResults = (model, query, options) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 20;
  const skip = (page - 1) * limit;

  return model.find(query).skip(skip).limit(limit);
};