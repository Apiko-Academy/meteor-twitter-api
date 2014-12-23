// Twitter API

TwitterApi = function(options) {
  this._url = "https://api.twitter.com";
  this._version = "1.1";
  this.app_auth_token = "";
  if (options) _.extend(this, options);
};

TwitterApi.prototype = {
  _getUrl: function(url){
    return [this._url, this._version, url].join('/');
  },
  get: function(url, params, userId){
    return this.call('GET', url, params, userId);
  },
  post: function(url, params, userId){
    return this.call('POST', url, params, userId);
  },
  call: function(method, url, params, userId){
    //this.unblock();
    oauthBinding = this.getOauthBindingForCurrentUser(userId);
    result = oauthBinding.call(method,
      this._getUrl(url),
      params
    );

    return result;
  },
  callAsApp: function(method, url, params){

    this.createApplicationToken();

    result = Meteor.http.call(method,
      this._getUrl(url), {
        params : params,
        headers : {
          'Authorization': 'Bearer ' + this.app_auth_token
        }
      });

      return result;
    },
    getOauthBinding: function() {
      var config = ServiceConfiguration.configurations.findOne({service: 'twitter'});
      var urls = {
        requestToken: "https://api.twitter.com/oauth/request_token",
        authorize: "https://api.twitter.com/oauth/authorize",
        accessToken: "https://api.twitter.com/oauth/access_token",
        authenticate: "https://api.twitter.com/oauth/authenticate"
      };

      return new OAuth1Binding(config, urls);
    },
    getOauthBindingForCurrentUser: function(userId){
      var oauthBinding = this.getOauthBinding();
      //var user = Meteor.user();
      var user = Meteor.users.findOne({_id: userId});
      oauthBinding.accessToken = user.services.twitter.accessToken;
      oauthBinding.accessTokenSecret = user.services.twitter.accessTokenSecret;

      return oauthBinding;
    },
    publicTimeline: function() {
      return this.get('statuses/home_timeline.json');
    },
    userTimeline: function() {
      return this.get('statuses/user_timeline.json');
    },
    mentionsTimeline: function() {
      return this.get('statuses/mentions_timeline.json');
    },
    postTweet: function(text, reply_to){
      tweet = {
        status: text,
        in_reply_to_status_id: reply_to || null
      };

      return this.post('statuses/update.json', tweet);
    },
    postRetweet: function(statusId) {
      return this.post('statuses/retweet/' + statusId + '.json');
    },
    postFavorite: function(statusId, userId) {
      return this.post('favorites/create.json', {id: statusId}, userId);
    },
    verifyCredentials: function() {
      return this.get('account/verify_credentials.json')
    },
    follow: function(screenName){
      return this.post('friendships/create.json',{screen_name: screenName, follow: true});
    },
    getFollowings: function(userId) {
      return this.get('followers/ids.json?screen_name=MichaelRokosh&user_id=' + userId);
    },
    getLists: function(user) {
      if (user) {
        return this.get("lists/list.json", {
          screen_name: user
        });
      } else {
        return this.get("lists/list.json");
      }
    },
    getListMembers: function(listId, cursor) {
      if (cursor === null) {
        cursor = "-1";
      }
      return this.get("lists/members.json", {
        list_id: listId,
        cursor: cursor
      });
    },
    userSearch: function(query, page, count, includeEntities) {
      if (page === null) {
        page = 0;
      }
      if (count === null) {
        count = 10;
      }
      if (includeEntities === null) {
        includeEntities = true;
      }
      return this.get("search/users.json", {
        q: query,
        page: page,
        count: count,
        include_entities: includeEntities
      });
    },
    advancedSearch: function(query, count, includeEntities, userId) {
      if (count === null) {
        count = 10;
      }
      if (includeEntities === null) {
        includeEntities = true;
      }
      return this.get("search/tweets.json", {
        q: query,
        count: count,
        include_entities: includeEntities
      }, userId);
    },
    search: function (query) {
      return this.callAsApp('GET', 'search/tweets.json', {
        'q': query
      });
    },
    createApplicationToken: function() {
      var url = 'https://api.twitter.com/oauth2/token',
      config = ServiceConfiguration.configurations.findOne({service: 'twitter'}),
      base64AuthToken = new Buffer(config.consumerKey + ":" + config.secret).toString('base64'),
      result = Meteor.http.post(url, {
        params: {
          'grant_type': 'client_credentials'
        },
        headers: {
          'Authorization': 'Basic ' + base64AuthToken,
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      });
      this.app_auth_token = result.data.access_token;
      return this.app_auth_token;
    }
  }
