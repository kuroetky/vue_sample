var vm = new Vue({
  el: '#app',
  data: {
    results: null,
    keyword: null,
    params: {
      q: '',
      part: 'snippet',
      type: 'video',
      maxResults: '10',
      key: '取得したAPIキー'
    }
  },
  methods: {
    searchMovies: function () {
      this.params.q = this.keyword;
      var self = this;
      axios
        .get('https://www.googleapis.com/youtube/v3/search', {params: this.params})
        .then(function (res) {
          self.results = res.data.items;
        })
        .catch(function (err) {
          console.log(err)
        });
    }
  }
});
