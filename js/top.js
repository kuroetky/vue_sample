// ページネーションを使えるようにする
Vue.component('paginate', VuejsPaginate);

var vm = new Vue({
    el: '#app',
    data: {
        apiKey: '', // API Key
        keyword: '', // 直前に検索したキーワードを保存しておく
        results: null,
        totalResults: null,
        // YouTube Data APIのリクエストパラメータ
        params: {
            // チャンネルを取得(Search: list)
            channel: {
                q: '', // 検索ワード
                part: 'snippet',
                type: 'channel',
                maxResults: '50',
                key: '' // API Key
            },
            // チャンネルの統計情報を取得(Channel: list)
            statistics: {
                part: 'snippet,statistics',
                id: '',  // チャンネルID
                key: '' // API Key
            }
        },
        sort: {
            // デフォルトで登録者数、昇順を選択
            key: 'subscriberCount',
            order: 'asc'
        },
        pagination: {
            // 初期ページ番号
            currentPage: 1,
            // アイテム数 / ページ
            parPage: 10
        }
    },
    methods: {
        // チャンネル検索(Search :list)
        searchChannels: function () {
            // 直前に検索したキーワードを再度検索する場合はAPIを叩かず、既存のresultsをソートする
            if(this.params.channel.q == this.keyword) {
                this.results = this.results.slice().sort(this.compareFunc);
            } else {
                var own = this;
                this.params.channel.key = this.apiKey;
                this.keyword = this.params.channel.q;
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
                        own.totalResults = res.data.pageInfo.totalResults;
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
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
                    // ソートキーに従ってソートする。デフォルトは検索時の結果をそのまま返す。
                    own.results = res.data.items.sort(own.compareFunc);
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        // 比較関数
        compareFunc: function (a, b) {
            var order = this.sort.order == "asc" ? true : false;
            switch(this.sort.key) {
                case 'subscriberCount':
                    return (a.statistics.subscriberCount - b.statistics.subscriberCount) * (order ? 1 : -1);
                case 'viewCount':
                    return (a.statistics.viewCount - b.statistics.viewCount) * (order ? 1 : -1);
                case 'videoCount':
                    return (a.statistics.videoCount - b.statistics.videoCount) * (order ? 1 : -1);
                case 'publishedAt':
                    return (new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt)) * (order ? 1 : -1);
                default:
                    return 0;
            }
        },
        // CSVファイルダウンロード
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
        },
        // ページネーションククリック時の処理
        clickCallback: function (pageNum) {
            this.pagination.currentPage = Number(pageNum);
        }
    },
    filters: {
        // APIで取得した日時を年月日に変換
        datetimeConvert: function(date) {
            var dateObj = new Date(date);
            var year = dateObj.getFullYear();
            var month = dateObj.getMonth() + 1;
            var day = dateObj.getDate();
            return (year + "年" + month + "月" + day + "日");
        }
    },
    computed: {
        getResults: function () {
            if (this.results != null) {
                var current = this.pagination.currentPage * this.pagination.parPage;
                var start = current - this.pagination.parPage;
                return this.results.slice(start, current);
            } else {
              return null;
            }
        },
        getPageCount: function() {
            if (this.results != null) {
                return Math.ceil(this.results.length / this.pagination.parPage);
            } else {
              return null;
            }
        }
    }
});
