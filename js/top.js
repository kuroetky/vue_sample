var vm = new Vue({
    el: '#app',
    data: {
        apiKey: '',
        results: null,
        params: {
            channel: {
                q: '',
                part: 'snippet',
                type: 'channel',
                maxResults: '10',
                key: ''
            },
            statistics: {
                part: 'snippet,statistics',
                id: '',
                key: ''
            }
        }
    },
    methods: {
        // チャンネル検索(Search :list)
        searchChannels: function () {
            var own = this;
            this.params.channel.key = this.apiKey;
            // YouTube Data API実行
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
        // チャンネル統計情報取得(Channel: list)
        searchChannelStatistics: function (channelIds) {
            this.params.statistics.id = channelIds.join(',');
            var own = this;
            this.params.statistics.key = this.apiKey;
            // YouTube Data API実行
            axios
                .get('https://www.googleapis.com/youtube/v3/channels', {params: this.params.statistics})
                .then(function (res) {
                    // デフォルトで登録者数順(降順)にソートする
                    own.results = res.data.items.sort(own.defaultCompareFunc);
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        defaultCompareFunc: function (a, b) {
            return b.statistics.subscriberCount - a.statistics.subscriberCount;
        },
        downloadCSV: function () {
            var csv = '\ufeff' + 'チャンネルURL,YouTuber名,登録者数,再生回数,チャンネル内容\n'
            this.results.forEach(el => {
                var line =
                'https://www.youtube.com/channel/' + el['id'] + ','
                + el['snippet']['title'].replace(/\r?\n/g,"") + ','
                + el['statistics']['subscriberCount'] + ','
                + el['statistics']['viewCount'] + ','
                + el['snippet']['description'].replace(/\r?\n/g,"") + '\n';
                csv += line;
            })
            let blob = new Blob([csv], { type: 'text/csv' });
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'Result.csv';
            link.click();
        }
    }
});
