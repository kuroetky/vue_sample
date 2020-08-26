// ページネーションを使えるようにする
Vue.component('paginate', VuejsPaginate);
// モーダルウィンドウ表示
Vue.use(window["vue-js-modal"].default);

var vm = new Vue({
    el: '#app',
    data: {
        apiKey: '', // API Key
        keyword: '', // 直前に検索したキーワードを保存しておく
        results: null,
        processedResults: null,
        rowCounts: null,
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
        },
        // おみくじの配列
        omikuji: ['ラジコンカー', 'ねこまんま', '怪獣映画', '四書五経', '文房具屋', '無抵抗', 'リラクゼーション', '健康診断', 'カーブミラー', '寝ぼけ', '堆積岩', '損害保険', 'コーヒー牛乳', '帝釈天', '化物', '同調圧力', '極楽浄土', '春巻き', 'マラカス', '初日の出', '邪魔者', '修行僧', '月', '自縄自縛', '彗星', 'センセーション', '3連休', '地震雲', '打ち出の小槌', 'ミーアキャット', '狼男', '栄養価', 'マヨネーズ', '避難警報', 'カッシーニの間隙', '準備運動', '写真', 'テニス', '社会人', 'タイムマシン', 'ひつじ', 'プロビデンスの目', 'パスタ', 'リンク', 'スケッチ', 'もち', 'ウォシュレット', '気温', 'フォーメーション', '別れ際'],
        sort: {
            // デフォルトで登録者数、昇順を選択
            key: 'subscriberCount',
            order: 'asc'
        },
        filter: {
            key: 'none',
            value: 0,
            order: 'more'
        },
        pagination: {
            // 初期ページ番号
            currentPage: 1,
            // アイテム数 / ページ
            parPage: 10
        }
    },
    watch: {
        results: function () {
            localStorage.setItem('results', JSON.stringify(this.results));
        },
        processedResults: function () {
            localStorage.setItem('processedResults', JSON.stringify(this.processedResults));
        }
    },
    mounted: function () {
        this.results = JSON.parse(localStorage.getItem('results')) || [];
        this.processedResults = JSON.parse(localStorage.getItem('processedResults')) || [];
    },
    methods: {
        // チャンネル検索(Search :list)
        searchChannels: function () {
            // ページを1ページ目に戻す
            this.pagination.currentPage = 1;
            // 直前に検索したキーワードを再度検索する場合はAPIを叩かず、既存のresultsを加工する
            if (this.params.channel.q == this.keyword) {
                this.processResults();
            } else {
                var own = this;
                this.params.channel.key = this.apiKey;
                //this.params.channel.key = encodeURIComponent(functions.config().youtube.key);
                this.keyword = this.params.channel.q;
                // YouTube Data API実行
                axios
                    .get('https://www.googleapis.com/youtube/v3/search', { params: this.params.channel })
                    .then(function (res) {
                        var channelIds = [];
                        for (item of res.data.items) {
                            channelIds.push(item.id.channelId);
                        }
                        console.log(channelIds);
                        own.totalResults = res.data.items.length;
                        own.searchChannelStatistics(channelIds);
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
            //this.params.statistics.key = encodeURIComponent(functions.config().youtube.key);
            // YouTube Data API実行
            axios
                .get('https://www.googleapis.com/youtube/v3/channels', { params: this.params.statistics })
                .then(function (res) {
                    // 検索結果の生データを保存
                    own.results = res.data.items;
                    // 検索結果を加工
                    own.processResults();
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        // 検索結果の加工
        processResults: function () {
            var current = this.pagination.currentPage * this.pagination.parPage;
            var start = current - this.pagination.parPage;
            // ソートキーに従ってソートする。
            var processedResults = this.results.sort(this.compareFunc);
            // フィルタキーに従ってソートする。
            processedResults = processedResults.filter(this.getFilteredResults);
            // フィルター後の件数を取得
            this.rowCounts = processedResults.length;
            // currentページの件数のみ加工データとして保存
            this.processedResults = processedResults.slice(start, current);
        },
        // ソート時の比較関数
        compareFunc: function (a, b) {
            var order = this.sort.order == "asc" ? true : false;
            switch (this.sort.key) {
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
        // フィルタリング時の比較関数
        getFilteredResults: function (result) {
            // 以上
            if (this.filter.order == 'more') {
                switch (this.filter.key) {
                    case 'subscriberCount':
                        return result.statistics.subscriberCount >= this.filter.value;
                    case 'viewCount':
                        return result.statistics.viewCount >= this.filter.value;
                    case 'videoCount':
                        return result.statistics.videoCount >= this.filter.value;
                    case 'publishedAt':
                        return new Date(result.snippet.publishedAt) >= new Date(this.filter.value);
                    default:
                        return true;
                }
                // 以下
            } else {
                switch (this.filter.key) {
                    case 'subscriberCount':
                        return result.statistics.subscriberCount <= this.filter.value;
                    case 'viewCount':
                        return result.statistics.viewCount <= this.filter.value;
                    case 'videoCount':
                        return result.statistics.videoCount <= this.filter.value;
                    case 'publishedAt':
                        return new Date(result.snippet.publishedAt) <= new Date(this.filter.value);
                    default:
                        return true;
                }
            }
        },
        // ページネーションククリック時の処理
        clickCallback: function (pageNum) {
            this.pagination.currentPage = Number(pageNum);
            this.processResults();
        },
        // CSVファイルダウンロード
        downloadCSV: function () {
            var csv = '\ufeff' + 'チャンネルURL,YouTuber名,登録者数,再生回数,投稿本数,チャンネル内容\n'
            this.results.forEach(el => {
                var line =
                    'https://www.youtube.com/channel/' + el['id'] + ','
                    + el['snippet']['title'].replace(/\r?\n/g, "") + ','
                    + el['statistics']['subscriberCount'] + ','
                    + el['statistics']['viewCount'] + ','
                    + el['statistics']['videoCount'] + ','
                    + el['snippet']['description'].replace(/\r?\n/g, "") + ','
                    + el['snippet']['publishedAt'] + '\n';
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
            this.params.channel.q = this.omikuji[Math.floor(Math.random() * this.omikuji.length)];
            this.searchChannels();
        },
        openWindow: function () {
            const url = "https://authtest-67ba4.web.app/#/signin"
            window.open(url, '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes')
        },
        // チーム開発（別ウィンドウ）
        openWindowTD: function () {
            const url = "repo/index.html"
            window.open(url, '_blank', 'scrollbars=no,resizable=no')
        },
        // チーム開発（モーダル）
        showTD: function () {
            this.$modal.show('modal-area');
        },

    },
    filters: {
        // APIで取得した日時を年月日に変換
        datetimeConvert: function (date) {
            var dateObj = new Date(date);
            var year = dateObj.getFullYear();
            var month = dateObj.getMonth() + 1;
            var day = dateObj.getDate();
            return (year + "年" + month + "月" + day + "日");
        }
    },
    computed: {
        // ページ数取得
        getPageCount: function () {
            if (this.results != null) {
                var filteredResultsCount = this.results.filter(this.getFilteredResults).length;
                return Math.ceil(filteredResultsCount / this.pagination.parPage);
            } else {
                return null;
            }
        }
    },
    components: {
        'carousel': VueCarousel.Carousel,
        'slide': VueCarousel.Slide
    },

});
