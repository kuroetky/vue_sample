var vm = new Vue({
  el: '#app',
  data: {
    results: null,
    keyword: null,
    params: {
      q: '東海オンエア',
      part: 'snippet',
      type: 'video',
      maxResults: '10',
      key: 'AIzaSyAZrymJcLspFg46RLEupb_n-JEz68yNDh8'
    }
  },
  methods: {
    searchMovies: function () {
      var self = this;
      axios
        .get('https://www.googleapis.com/youtube/v3/search', {params: this.params})
        .then(function (res) {
          console.log(res)
          self.results = res.data.items;
        })
        .catch(function (err) {
          console.log(err)
        });
    }
  }
});
