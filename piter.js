/*
 * piterbot
 *
 * Written by TheReturningVoid 2017
 */

// Includes
const Eris = require("eris")
const Twitter = require("twitter")
const Google = require("googleapis")
const Express = require("express")
const fs = require("fs")
const random = require("random-js")();
const youtube = Google.youtube("v3")
const webapp = Express()
const http = require("http").Server(webapp)
const io = require("socket.io")(http)

// Load API keys
var apiKeys = { }
try {
  apiKeys = JSON.parse(fs.readFileSync("keys.json", "utf8"))
} catch (err) {
  console.log("ni keys.json, mekin dafult...")
  apiKeys = { }
  fs.writeFileSync("keys.json", JSON.stringify(apiKeys, null, 2))
}

// Inclue web apis
const piter = new Eris(apiKeys.discord)
const twitr = new Twitter({
  consumer_key: apiKeys.twitterConsumer,
  consumer_secret: apiKeys.twitterSecret,
  bearer_token: apiKeys.twitterBearer
})

// Logger function
function log(msg) {
  console.log(msg)
  io.emit("piterbot_log_message", msg)
}

// Web side configuration
webapp.use(Express.static("node_modules/bootstrap/dist"))
webapp.use(Express.static("node_modules/jquery/dist"))
http.listen(42069, () => {
  log("web psnel dtarfed")
})
webapp.get("/", (req, res) => {
  res.sendFile(__dirname + "/html/index.html")
})
webapp.get("/settings", (req, res) => {
  res.sendFile(__dirname + "/html/settings.html")
})

// Socket configuraton
io.on("connection", function (socket) {
  log("cinmectrd ti cintril panrl")
  socket.on("piterbot_query_keys", (dummy) => {
    socket.emit("piterbot_key_info", apiKeys)
  })
  socket.on("piterbot_update_keys", (obj) => {
    apiKeys = obj
    fs.open("keys.json", "w+", (err, file) => {
      if (err) {
        log("FOLE OPRN BRIKEND!!!")
        log(err)
        fs.closeSync(file)
        return
      }
      fs.writeFile(file, JSON.stringify(apiKeys, null, 2), (err2) => {
        if (err2) {
          log("FOLE WRIT BRIKEND!!!")
          log(err2)
          fs.close(file)
          return
        }
      })
    })
    socket.emit("piterbot_keys_updated")
  })
})

// Initializing caches
log("updstung tweets.txt...")
fs.open("tweets.txt", "w+", (err, file) => {
  if (err) {
    log("FOLE OPRN BRIKEND!!!")
    log(err)
    fs.closeSync(file)
    return
  }
  twitr.get("/statuses/user_timeline", {screen_name:"peter_mary_17",count:200}, (err2, tweets, resp) => {
    if (err2) {
      log("TWITD GETIN BRIKEND!!!")
      log(err2)
      fs.closeSync(file)
      return
    }
    var tweetArr = []
    for (i=0; i<tweets.length; i++) {
      tweetArr[i] = tweets[i].text
    }
    fs.writeFile(file, tweetArr.join("\n"), (err3) => {
      if (err3) {
        log("FOLE WRIT BRIKEND!!!")
        log(err3)
        fs.closeSync(file)
        return
      }
      fs.close(file, (err) => {
        log("tweets.txt upsdtung ti 11,2")
      })
    })
  })
})
log("updstung gudies.txt...")
fs.open("gudies.txt", "w+", (err, file) => {
  if (err) {
    log("FOLE OPRN BRIKEND!!!")
    log(err)
    fs.closeSync(file)
    return
  }
  var videos = []
  var count = 1
  function getVideos(page, callback) {
    youtube.search.list({
      key: apiKeys.google,
      part: "snippet",
      q: "how to hack 3ds",
      type: "video",
      pageToken: page
    }, (err2, data) => {
      if (err2) {
        log("YIUTYBE BRIKEND!!!")
        log(err2)
        fs.closeSync(file)
        return
      }
      data.items.forEach(vid => {
        videos.push("https://youtube.com/watch?v=" + vid.id.videoId)
      })
      if (count != 20) {
        count++
        getVideos(data.nextPageToken, callback)
      } else {
        callback()
      }
    })
  }
  getVideos("", () => {
    fs.writeFile(file, videos.join("\n"), "utf8", (err3) => {
      if (err3) {
        log("FOLE WRIT BRIKEND!!!")
        log(err3)
        fs.closeSync(file)
        return
      }
      fs.close(file, (err) => {
        log("gudies.txt upsdtung ti 11,2")
      })
    })
  })
})

// Start Discord bot
piter.on("ready", () => {
  log(`jouned ad ${piter.user.username} - ${piter.token}`)
})

// Conficure bot commands
piter.on("messageCreate", (msg) => {
  if (msg.content === ".rtweet") {
    log(".rtweet comeend tecuvd")
    fs.open("tweets.txt", "r", (err, file) => {
      if (err) {
        log("FOLE OPRN BRIKEND!!!")
        log(err)
        fs.close(file)
        return
      }
      fs.readFile(file, "utf8", (err2, tweetsFile) => {
        if (err2) {
          log("FOLE RED BRIKEND!!!")
          log(err)
          fs.close(file)
          return
        }
        var tweets = tweetsFile.split("\n")
        msg.channel.createMessage(tweets[random.integer(0, tweets.length-1)])
      })
    })
  } else if (msg.content === ".gudie") {
    log(".gudie comeend tecuvd")
    fs.open("gudies.txt", "r", (err, file) => {
      if (err) {
        log("FOLE OPRN BRIKEND!!!")
        log(err)
        fs.close(file)
        return
      }
      fs.readFile(file, "utf8", (err2, gudiesFile) => {
        if (err2) {
          log("FOLE RED BRIKEND!!!")
          log(err)
          fs.close(file)
          return
        }
        var gudies = gudiesFile.split("\n")
        msg.channel.createMessage(gudies[random.integer(0, gudies.length-1)])
      })
    })
  } else if (msg.content === ".bricc") {
    log(".bricc comeend tecuvd")
    msg.channel.createMessage("https://images.discordapp.net/eyJ1cmwiOiJodHRwczovL2Rpc2NvcmQuc3RvcmFnZS5nb29nbGVhcGlzLmNvbS9hdHRhY2htZW50cy8yNjIwODIwODgxODA2NDU4ODkvMjY5Mjg2OTk5MzQ3ODIyNjAzL0JSSUNLLnBuZyJ9.h-zlYZeTjFldawC93Pe3grursnM")
  }
})

piter.connect()
