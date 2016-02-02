var fs = require('fs');
var Twitter = require('twitter');
var Request = require('request');
var Exec = require('child_process').exec;


const maxColLength = 20

var twitterClient = new Twitter({
  consumer_key: twitterCKey,
  consumer_secret: twitterSecretKey,
  access_token_key: twitterAccess,
  access_token_secret: twitterSecretAccess
});

var allUsers = ["kevinmkarol","BirdsAndTweets"]
//69 should be max index for questions
var questions = ["What would be the first phrase you taught your kid?", 
                 "Describe an experience that got you excited.", 
                 "What would you say if someone said they love you?",
                 "If you were about to die, what are your last words?",
                 "On your first date a waiter is rude, what do you say?",
                 "What will your legacy be?",
                 "What do you shout during your victory dance?",
                 "If you could only say one thing, what would it be?",
                 "What would you like inscribed on your gravestone?",
		 "What's the first line in the movie of your life?",
		 "Describe something that embarasses you."
                 ]

var noFriends = ["Have you ever heard of The Silent Majority?",
		 "Better they say nothing than something bad.  Right?",
		 "You see?  Plenty of time to spend with you."
		]
var noAnswer = ["ummmm.....not sure?",
		"Isn't that a bit personal?",
		"That's a 2 month anniversary sort of question.",
		"If you can't say something nice...",
		"Now why do you have to ask a question like that?"
		]


function ProfileInfo(photoFilePath
                        , applicant
                        , screen_name
                        , about1
                        , about2
                        , about3
                        , question1
                        , question2
                        , question3
                        , question4
                        , answer1
                        , answer2
                        , answer3
                        , answer4
                        , hashTag1
                        , hashTag2
                        , hashTag3
                        , hashTag4
                        , hashTag5
                        , hashTag6
                        , reference1
                        , reference2
                        , reference3
                        , reference4)
{
  this.photoFilePath = photoFilePath
  this.applicant = applicant
  this.screen_name = screen_name
  this.about1 = about1
  this.about2 = about2
  this.about3 = about3
  this.question1 = question1
  this.question2 = question2
  this.question3 = question3
  this.question4 = question4
  this.answer1 = answer1
  this.answer2 = answer2
  this.answer3 = answer3
  this.answer4 = answer4
  this.hashTag1 = hashTag1
  this.hashTag2 = hashTag2
  this.hashTag3 = hashTag3
  this.hashTag4 = hashTag4
  this.hashTag5 = hashTag5
  this.hashTag6 = hashTag6
  this.reference1 = reference1
  this.reference2 = reference2
  this.reference3 = reference3
  this.reference4 = reference4
}



function listenForTweets(){
  twitterClient.stream('statuses/filter', {track: 'HeartsATweeter'}, function(stream){
    stream.on('data', function(tweet){
      if(tweet.user.screen_name == "HeartsATweeter") return;
      //console.log(tweet);
      var splitTweet = tweet["text"].split("@HeartsATweeter");
      var fullStatement = "";
      for(part in splitTweet){
        fullStatement += splitTweet[part];
      }


      var splitTweet = fullStatement.split("@heartsatweeter");
      var fullStatement = "";
      for(part in splitTweet){
        fullStatement += splitTweet[part];
      }

      var splitTweet = fullStatement.split("@Heartsatweeter");
      var fullStatement = "";
      for(part in splitTweet){
        fullStatement += splitTweet[part];
      }

      var myProfile = new ProfileInfo(tweet.user.screen_name
                        , tweet.user.name
                        , tweet.user.screen_name
                        , ""
                        , ""
                        , ""
                        , "What does a typical Saturday look like for you?"
                        , "If you could only say one phrase for the rest of your life, what would it be?"
                        , "How would you describe your politics?"
                        , "If you were a food item, and someone took a bite, what would they say?"
                        , fullStatement
                        , ""
                        , ""
                        , ""
                        , "#"
                        , "#"
                        , "#"
                        , "#"
                        , "#"
                        , "#"
                        , "" 
                        , ""
                        , ""
                        , ""
                       );
      getProfilePicture(myProfile);
    });

    stream.on('error', function(error){
      console.log(error);
    });
  });
}

function getProfilePicture(resumeInfo){
  params = {'screen_name': resumeInfo.photoFilePath}
  twitterClient.get('users/show', params, function(error, picture, response){
    if (!error) {
      console.log("profile picture retrieved")
      biggerURL = picture.profile_image_url.replace("_normal", "")
      downloadImageFromURL(biggerURL, "profpic.jpg", resumeInfo);
    }else{
      console.log(error);
    }
  });
}

//Image download code adopted from
//http://elifitch.com/blog/simple-web-scraping-node/
function downloadImageFromURL(url, filePath, resumeInfo){
  Request(url, function(err, resp, body){   
    var curl =  'curl ' + url.replace(/&/g,'\\&') +' -o ' + filePath + ' --create-dirs';
    var child = Exec(curl, function(err, stdout, stderr) {
      if (err){ console.log(stderr); throw err; } 
      else{ 
        console.log(' download successful ');
        resumeInfo.photoFilePath = filePath
        getAllUserTweets([], resumeInfo); 
      }
    });
  });
}

function getAllUserTweets(tweetArray, resumeInfo){
  //console.log(tweetArray)
  var requestNumber = 200  
  var tweetMaxCorpus = 1000
  params = {"screen_name": resumeInfo.screen_name, "count": requestNumber, "include_rts": 1}
  if(tweetArray.length > 0){
    var tweetID = tweetArray[tweetArray.length - 1].id
    var lessThanID = (parseInt(tweetID) - 100)
    params["max_id"] = lessThanID
  }
  //console.log(params)
  twitterClient.get('statuses/user_timeline', params, function(error, tweets, response){
  if (!error) {
    console.log("tweets downloaded")
    //console.log(tweets)
    for(index in tweets){
      tweetArray.push({"tweet": tweets[index].text, "id":tweets[index].id})
    }
    if(tweets.length == requestNumber && tweetArray.length < tweetMaxCorpus){
      getAllUserTweets(tweetArray, resumeInfo)
    }else{
      processCorpus(tweetArray, resumeInfo)
    }

  }else{
    console.log(error);
  }
});

}

function processCorpus(tweetArray, resumeInfo){
  console.log("processing corpus")
  var maxHashTagLength = 16
  var maxTweetLength = 75
  hashTagDensityMap = consolodateHashtags(tweetArray)

  //Process hashtags
  topSixValues = [{"tag":"","count":0},{"tag":"","count":0},{"tag":"","count":0},
                  {"tag":"","count":0},{"tag":"","count":0},{"tag":"","count":0}]
  for(key in hashTagDensityMap){
    if(key.length < maxHashTagLength){
      count = hashTagDensityMap[key]
      for(j in topSixValues){
        if(count > topSixValues[j].count){
          topSixValues.splice(j,0,{"tag":key, "count":count})
          topSixValues.pop()
          break
        }
      }
    }
  }
  resumeInfo.hashTag1 = topSixValues[0].tag
  resumeInfo.hashTag2 = topSixValues[1].tag
  resumeInfo.hashTag3 = topSixValues[2].tag
  resumeInfo.hashTag4 = topSixValues[3].tag
  resumeInfo.hashTag5 = topSixValues[4].tag
  resumeInfo.hashTag6 = topSixValues[5].tag

  console.log("hashtags assigned")

  //Process answers
  noAt = tweetsNoAt(tweetArray)
  noAt = filterForLength(noAt, maxTweetLength, null)

  var distinctIndexes = new Set()
  while(distinctIndexes.size < 3 && distinctIndexes.size != noAt.length){
      distinctIndexes.add(numberInRange(noAt.length))
  }

  distinctIndexes.forEach(function(index){
    if(resumeInfo.answer2 == ''){
      resumeInfo.answer2 = noAt[index]
    }else if(resumeInfo.answer3 == ''){
      resumeInfo.answer3 = noAt[index]
    }else if(resumeInfo.answer4 == ''){
      resumeInfo.answer4 = noAt[index]
    }
  });

  //console.log(noAt)
  getTwitterBio(resumeInfo)
}

function consolodateHashtags(tweetArray){
  mappedHashtag = {}
  for (i in tweetArray){
    tweetWrapper = tweetArray[i]
    var re = /\S*#(?:\[[^\]]+\]|\S+)////\b#+.*/ ///(^|\W)(\b#[a-z\d][\w-]*)/ig ///(^#|[^&]#)([a-z0-9]+)/gi
    var matches = re.exec(tweetWrapper.tweet)
    for (j in matches){
      hashtag = matches[j]
      hashtag = hashtag.toString().split(" ")[0]
      if(hashtag[0] == "#"){
        if(hashtag in mappedHashtag){
          mappedHashtag[hashtag] = mappedHashtag[hashtag] + 1
        }else{
          mappedHashtag[hashtag] = 1
        }
      }
    }
  } 
  return mappedHashtag
}

function tweetsNoAt(tweetArray){
  noAt = []
  for (i in tweetArray){
    tweetWrapper = tweetArray[i]
    if(!containsSubstring(tweetWrapper.tweet, "@")){
      noAt.push(tweetWrapper.tweet)
    }
  } 
  return noAt
}

function getTwitterBio(resumeInfo){
  console.log("get twitter Bio")
  params = {"screen_name": resumeInfo.screen_name}
  twitterClient.get('users/show', params, function(error, wrapper, response){
    bio = wrapper.description
    if(bio.length > 100){
      resumeInfo.about1 = bio.substring(0, 50)
      resumeInfo.about2 = bio.substring(50, 100)
      resumeInfo.about3 = bio.substring(100, bio.length)
    }else if(bio.length > 50){
      resumeInfo.about1 = bio.substring(0, 50)
      resumeInfo.about2 = bio.substring(50, bio.length)
    }else{
      resumeInfo.about1 = bio.substring(0, bio.length)
    }
    getTweetsAtUser([], resumeInfo)
  });
}

function getTweetsAtUser(tweetArray, resumeInfo){ 
  console.log("getTweetsAtUser")
  var requestNumber = 100
  var tweetMaxCorpus = 300
  var maxTweetLength = 40

  var params = {q:"@" + resumeInfo.screen_name, "count": requestNumber};
  if(tweetArray.length > 0){
    var tweetID = tweetArray[tweetArray.length - 1].id
    var lessThanID = (parseInt(tweetID) - 100)
    params["max_id"] = lessThanID  
  }
  twitterClient.get('search/tweets', params, function(error, wrapper, response){
    if (!error) {
      for(i in wrapper.statuses){
        tweet = wrapper.statuses[i]
        fromUser = wrapper.statuses[i].user.name
        if(containsSubstring(tweet.text, "@" + resumeInfo.screen_name) && tweet.text.length < maxTweetLength){
          tweetArray.push({"tweet":tweet, "fromUser":fromUser})
        }
      }

      if(wrapper.length == requestNumber && tweetArray.length < tweetMaxCorpus){
        getTweetsAtUser(tweetArray, resumeInfo)
      }else{
        console.log(tweetArray)
        if(tweetArray.length >= 4){
          var indexes = selectDistinctNumbers(4, tweetArray.length)
          var tweet1 = tweetArray[index[0]]
          resumeInfo.reference1 = '"' + tweet1.tweet.text +'"' + " -" + tweet1.fromUser
          var tweet2 = tweetArray[index[1]]
          resumeInfo.reference2 = '"' + tweet2.tweet.text +'"' + " -" + tweet2.fromUser
          var tweet3 = tweetArray[index[2]]
          resumeInfo.reference3 = '"' + tweet3.tweet.text +'"' + " -" + tweet3.fromUser
          var tweet4 = tweetArray[index[3]]
          resumeInfo.reference4 = '"' + tweet4.tweet.text +'"' + " -" + tweet4.fromUser
        }else{
          for(i in tweetArray){
            if(i == 0){
              var tweet1 = tweetArray[i]
              resumeInfo.reference1 = '"' + tweet1.tweet.text +'"' + " -" + tweet1.fromUser
            }else if(i == 1){
              var tweet2 = tweetArray[i]
              resumeInfo.reference2 = '"' + tweet2.tweet.text +'"' + " -" + tweet2.fromUser
            }else if(i == 2){
              var tweet3 = tweetArray[i]
              resumeInfo.reference3 = '"' + tweet3.tweet.text +'"' + " -" + tweet3.fromUser
            }
          }
        }

      }

      selectQuestions(resumeInfo)
    }else{
      console.log(error);
    }
  });
}

function selectQuestions(resumeInfo){
  console.log("select questions")
  var questionArray = selectDistinctNumbers(4, questions.length)
  resumeInfo.question1 = questions[questionArray[0]]
  resumeInfo.question2 = questions[questionArray[1]]
  resumeInfo.question3 = questions[questionArray[2]]
  resumeInfo.question4 = questions[questionArray[3]]
  fillInMissing(resumeInfo)
}

function fillInMissing(resumeInfo){
  if(resumeInfo.reference1 == ""){
    var referenceArray = selectDistinctNumbers(1, noFriends.length)
    resumeInfo.reference1 = noFriends[referenceArray[0]]
  }

  if(resumeInfo.answer1 == ""){
    var answerArray = selectDistinctNumbers(1, noAnswer.length)
    resumeInfo.answer1 = noAnswer[answerArray[0]]
  }

  if(resumeInfo.answer2 == ""){
    var answerArray = selectDistinctNumbers(1, noAnswer.length)
    resumeInfo.answer2 = noAnswer[answerArray[0]]
  }

  if(resumeInfo.answer3 == ""){
    var answerArray = selectDistinctNumbers(1, noAnswer.length)
    resumeInfo.answer3 = noAnswer[answerArray[0]]
  }


  if(resumeInfo.answer4 == ""){
    var answerArray = selectDistinctNumbers(1, noAnswer.length)
    resumeInfo.answer4 = noAnswer[answerArray[0]]
  }

  generateProfile(resumeInfo)
}


function generateProfile(resumeInfo){
  var width = 850
  var height = 1100
  var font = "Helvetica"

  var Canvas = require('canvas')
    , Image = Canvas.Image
    , canvas = new Canvas(width, height)
    , ctx = canvas.getContext('2d');



  //background colors
  ctx.fillStyle = "#000066"
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = "#FFFFFF"

  /**
  *** HEADER
  **/

  var titleXGuide = 250;
  var nameYGuide = 100;
  var headerSpacing = 30;
  var profileX = 25;
  var profileY = 25;

  /**
  *** About me
  **/

  var qXGuide = profileX;
  var qYGuide = 300;
  var qSpacing = 70;
  var qOffset = 35;
  var aOffset = 25;

  ctx.font = '40px' + font;
  ctx.fillText("About Me", qXGuide, qYGuide)

  var q1y = qYGuide + qOffset;
  var q2y = q1y + qSpacing;
  var q3y = q2y + qSpacing;
  var q4y = q3y + qSpacing;

  ctx.font = '30px' + font;
  ctx.fillText(resumeInfo.question1, qXGuide, q1y)
  ctx.fillText(resumeInfo.question2, qXGuide, q2y)
  ctx.fillText(resumeInfo.question3, qXGuide, q3y)
  ctx.fillText(resumeInfo.question4, qXGuide, q4y)

  //Answers to questions

  var a1y = q1y + aOffset;
  var a2y = q2y + aOffset;
  var a3y = q3y + aOffset;
  var a4y = q4y + aOffset;

  ctx.font = '20px' + font;
  ctx.fillText(resumeInfo.answer1, qXGuide, a1y)
  ctx.fillText(resumeInfo.answer2, qXGuide, a2y)
  ctx.fillText(resumeInfo.answer3, qXGuide, a3y)
  ctx.fillText(resumeInfo.answer4, qXGuide, a4y)

  /**
  *** Favorite #s
  **/

  var favXGuide = profileX;
  var favXCol2 = profileX + 250;
  var favXCol3 = profileX + 500;

  var favYGuide = 650;
  var favSpacing = 35;
  var favOffset = 35;

  ctx.font = '40px' + font;
  ctx.fillText("My Favorite #s", favXGuide, favYGuide)

  var fav1y = favYGuide + favOffset;
  var fav2y = fav1y;
  var fav3y = fav2y;

  var fav4y = fav1y + favSpacing;
  var fav5y = fav4y;
  var fav6y = fav5y;


  ctx.font = '25px' + font;
  ctx.fillText(resumeInfo.hashTag1, favXGuide, fav1y)
  ctx.fillText(resumeInfo.hashTag2, favXCol2, fav2y)
  ctx.fillText(resumeInfo.hashTag3, favXCol3, fav3y)

  ctx.fillText(resumeInfo.hashTag4, favXGuide, fav4y)
  ctx.fillText(resumeInfo.hashTag5, favXCol2, fav5y)
  ctx.fillText(resumeInfo.hashTag6, favXCol3, fav6y)

  /**
  *** References
  **/

  var refXGuide = profileX;

  var refYGuide = 800;
  var refSpacing = 35;
  var refOffset = 35;

  ctx.font = '40px' + font;
  ctx.fillText("What my Friends Say About Me", refXGuide, refYGuide)

  var ref1y = refYGuide + refOffset;
  var ref2y = ref1y + refSpacing;
  var ref3y = ref2y + refSpacing;
  var ref4y = ref3y + refSpacing;

  ctx.font = '25px' + font;
  ctx.fillText(resumeInfo.reference1, refXGuide, ref1y)
  ctx.fillText(resumeInfo.reference2, refXGuide, ref2y)
  ctx.fillText(resumeInfo.reference3, refXGuide, ref3y)
  ctx.fillText(resumeInfo.reference4, refXGuide, ref4y)

  /**
  *** Timestamp
  **/

  ctx.font = '20px' + font;
  var timeStampMessage = "Created by @BirdsAndTweets"  
  ctx.fillText(timeStampMessage, refXGuide, 1080);

  fs.readFile(resumeInfo.photoFilePath, function(err, picture){
    //console.log("loaded");
    if(err) throw err;
    img = new Image;
    img.src = picture;

    //Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0,0, width, 200 + profileY*2)
    ctx.fillStyle = "#000000"

    ctx.font = '50px' + font;
    ctx.fillText(resumeInfo.applicant, titleXGuide, nameYGuide);
   
    ctx.font = '20px' + font;
    ctx.fillText(resumeInfo.about1, titleXGuide, nameYGuide + headerSpacing)
    ctx.fillText(resumeInfo.about2, titleXGuide, nameYGuide + headerSpacing*2)
    ctx.fillText(resumeInfo.about3, titleXGuide, nameYGuide + headerSpacing*3)

    ctx.drawImage(img, profileX, profileY, 200, 200);

    var out = fs.createWriteStream("resume2.jpeg")
    var stream = canvas.jpegStream();

    stream.on('data', function(chunk){
      out.write(chunk);
      //console.log("writing Chunk");
    });

    stream.on('end', function(){ 
       //console.log("stream end");
       out.end();
    });

    out.on('finish', function(){
      //console.log("closed");
      tweet = generateMatchText(resumeInfo)
      postToTwitter(tweet, "resume2.jpeg");
    });
 
  });
}

function generateMatchText(resumeInfo){
  allUsers.push(resumeInfo.screen_name)
  var baseText = ".@" + resumeInfo.screen_name + ", what a match. "
  var index = selectDistinctNumbers(1, allUsers.length)
  var yourMatch = allUsers[index[0]]
  while(yourMatch == resumeInfo.screen_name){
    var index = selectDistinctNumbers(1, allUsers.length)
    var yourMatch = allUsers[index[0]]
  }

  var matchText = "You and " + yourMatch + " would get along well!"
  return baseText + matchText

}

function postToTwitter(text, filePath){
  console.log("posting tweet"); 
  var data = fs.readFileSync(filePath);
  twitterClient.post('media/upload', {media: data}, function(error, media, response){

    if(!error){
      var status = {
        status: text,
        media_ids: media.media_id_string
      }

      twitterClient.post('statuses/update', status, function(error, tweet, response){
        if(!error){
          //console.log(tweet);
        }
      });
    }else{
      console.log("Posting error " + error);
    }
  });
}



/**********************
*********Utility Functions
**********************/

function filterForLength(stringArray, len){
  shortEnough = []
  for(i in stringArray){
    if(stringArray[i].length < len){
      shortEnough.push(stringArray[i])
    }
  }
  return shortEnough
}

function containsSubstring(string, substring){
  return (string.indexOf(substring) != -1);
}


function numberInRange(max){
  return Math.floor(Math.random() * max);
}

function selectDistinctNumbers(howMany, max){
  if(howMany > max){ return }
  var distinctNumbers= new Set()

  while(distinctNumbers.size < howMany){
    distinctNumbers.add(numberInRange(max))
  }

  return Array.from(distinctNumbers)
}


listenForTweets();


