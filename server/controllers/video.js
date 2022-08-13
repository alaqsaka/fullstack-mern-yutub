import User from "../models/User.js";
import Video from "../models/Video.js";
import { createError } from "../error.js";

export const addVideo = async (req, res, next) => {
  const newVideo = new Video({ userId: req.user.id, ...req.body });
  try {
    const savedVideo = await newVideo.save();
    res.status(200).json({
      status: 200,
      success: true,
      data: savedVideo,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Video not found!"));
    if (req.user.id === video.userId) {
      const updatedVideo = await Video.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        {
          new: true,
        }
      );

      res.status(200).json({
        status: 200,
        success: true,
        updatedVideo,
      });
    } else {
      return next(createError(404, "You can update only your video!"));
    }
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Video not found!"));
    if (req.user.id === video.userId) {
      await Video.findByIdAndDelete(req.params.id);

      res.status(200).json({
        status: 200,
        success: true,
        message: "The video has been deleted.",
      });
    } else {
      return next(createError(404, "You can delete only your video!"));
    }
  } catch (error) {
    next(error);
  }
};

export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    res.status(200).json({
      status: 200,
      success: true,
      video,
    });
  } catch (error) {
    next(error);
  }
};

export const addView = async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });
    res.status(200).json({
      status: 200,
      success: true,
      message: "The view has been incremented",
    });
  } catch (error) {
    next(error);
  }
};

export const random = async (req, res, next) => {
  try {
    // will return 40 random videos from the database
    const videos = await Video.aggregate([{ $sample: { size: 40 } }]);
    res.status(200).json({
      status: 200,
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

export const trend = async (req, res, next) => {
  try {
    // will return videos sorted by the most viewed video
    const videos = await Video.find().sort({ views: -1 });
    res.status(200).json({
      status: 200,
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

export const sub = async (req, res, next) => {
  try {
    // get user info
    const user = await User.findById(req.user.id);
    // get user subscribed channels
    const subscibedChannels = user.subscribedUsers;

    const list = await Promise.all(
      subscibedChannels.map((channelId) => {
        return Video.find({ userId: channelId });
      })
    );

    res.status(200).json({
      status: 200,
      success: true,
      data: list.flat().sort((a, b) => b.createdAt - a.createdAt),
    });
  } catch (error) {
    next(error);
  }
};

export const getByTag = async (req, res, next) => {
  try {
    const tags = req.query.tags.split(",");
    // will return videos with tags sent by query
    const videos = await Video.find({ tags: { $in: tags } }).limit(20);
    res.status(200).json({
      status: 200,
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

export const search = async (req, res, next) => {
  const query = req.query.q;
  try {
    const videos = await Video.find({
      title: { $regex: query, $options: "i" },
    }).limit(40);
    res.status(200).json({
      status: 200,
      success: true,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};
