var API_KEY = 'AIzaSyAZrymJcLspFg46RLEupb_n-JEz68yNDh8'
var vm = new Vue({
  el: '#app',
  data: {
    results: null,
    params: {
      channel: {
        q: '',
        part: 'snippet',
        type: 'channel',
        maxResults: '5',
        key: API_KEY
      },
      statistics: {
        part: 'snippet,statistics',
        id: '',
        key: API_KEY
      }
    }
  },
  methods: {
    searchChannels: function () {
      var own = this;
      axios
        .get('https://www.googleapis.com/youtube/v3/search', {params: this.params.channel})
        .then(function (res) {
          var channelIds = [];
          for(item of res.data.items) {
            channelIds.push(item.id.channelId);
          }
          console.log(channelIds);
          own.searchChannelStatistics(channelIds);
        })
        .catch(function (err) {
          console.log(err);
        });
    },
    searchChannelStatistics: function (channelIds) {
      this.params.statistics.id = channelIds.join(',');
      var own = this;
      axios
        .get('https://www.googleapis.com/youtube/v3/channels', {params: this.params.statistics})
        .then(function (res) {
          own.results = res.data.items;
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  }
});
