const express = require("express");
const ytdl = require("ytdl-core");
const path = require("path");
const app = express();
const port = 3000;

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Default template variables middleware
app.use((req, res, next) => {
  res.locals = {
    title: "YouTube Downloader",
    message: "",
    videoInfo: null,
  };
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

// app.post('/download', async (req, res) => {
//   try {
//     const videoURL = req.body.videoURL;

//     if (!ytdl.validateURL(videoURL)) {
//       res.locals.message = 'Invalid YouTube URL';
//       return res.render('index');
//     }

//     const videoId = ytdl.getURLVideoID(videoURL);
//     const info = await ytdl.getInfo(videoId);

//     res.locals.message = 'Ready to download!';
//     res.locals.videoInfo = {
//       title: info.videoDetails.title,
//       thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
//       videoId: videoId
//     };

//     res.render('index');
//   } catch (error) {
//     console.error(error);
//     res.locals.message = 'Error: Could not fetch video info';
//     res.render('index');
//   }
// });

app.post("/download", async (req, res) => {
  try {
    const videoURL = req.body.videoURL;

    if (!ytdl.validateURL(videoURL)) {
      res.locals.message = "Invalid YouTube URL";
      return res.render("index");
    }

    // Add these options to bypass signature extraction issues
    const options = {
      quality: "highestaudio",
      requestOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        },
      },
    };

    const videoId = ytdl.getURLVideoID(videoURL);
    const info = await ytdl.getInfo(videoId, options);

    res.locals.message = "Ready to download!";
    res.locals.videoInfo = {
      title: info.videoDetails.title,
      thumbnail:
        info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]
          .url,
      videoId: videoId,
    };

    res.render("index");
  } catch (error) {
    console.error("Error details:", error);
    res.locals.message =
      "Error: YouTube is blocking this request. Please try again later or try a different video.";
    res.render("index");
  }
});

// app.get("/download/:type/:videoId", async (req, res) => {
//   try {
//     const { type, videoId } = req.params;
//     const info = await ytdl.getInfo(videoId);
//     const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

//     res.header(
//       "Content-Disposition",
//       `attachment; filename="${title}.${type}"`
//     );

//     if (type === "mp3") {
//       ytdl(videoId, { quality: "highestaudio" }).pipe(res);
//     } else {
//       ytdl(videoId, { quality: "highestvideo" }).pipe(res);
//     }
//   } catch (error) {
//     console.error(error);
//     res.redirect("/");
//   }
// });

app.get('/download/:type/:videoId', async (req, res) => {
  try {
    const { type, videoId } = req.params;
    const options = {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36'
        }
      }
    };

    const info = await ytdl.getInfo(videoId, options);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    res.header('Content-Disposition', `attachment; filename="${title}.${type}"`);

    if (type === 'mp3') {
      ytdl(videoId, { 
        quality: 'highestaudio',
        ...options
      }).pipe(res);
    } else {
      ytdl(videoId, { 
        quality: 'highestvideo',
        ...options
      }).pipe(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.locals.message = 'Download failed. YouTube might be blocking this request.';
    res.redirect('/');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
