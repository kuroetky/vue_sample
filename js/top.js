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
            },
            // おみくじの配列
            omikuji: ['ラジコンカー','ねこまんま','怪獣映画','四書五経','文房具屋','無抵抗','リラクゼーション','健康診断','カーブミラー','寝ぼけ','堆積岩','損害保険','コーヒー牛乳','帝釈天','化物','同調圧力','極楽浄土','春巻き','マラカス','初日の出','邪魔者','修行僧','月','自縄自縛','彗星','センセーション','3連休','地震雲','打ち出の小槌','ミーアキャット','狼男','栄養価','マヨネーズ','避難警報','カッシーニの間隙','準備運動','写真','テニス','社会人','タイムマシン','ひつじ','プロビデンスの目','パスタ','リンク','スケッチ','もち','ウォシュレット','気温','フォーメーション','別れ際']
        },
        sort: {
            // デフォルトで登録者数、昇順を選択
            key: 'subscriberCount',
            order: 'asc'
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
        // おみくじ検索(Search :list)
        omikujiSearch: function () {
            // 検索ワードとしておみくじ配列からランダムで取得
            this.params.channel.q = Math.floor(Math.random() * this.params.channel.omikuji.length);
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
        openWindow: function() {
            const url = "https://authtest-67ba4.web.app/#/signin"
            window.open(url, '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes')
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
    }
});
