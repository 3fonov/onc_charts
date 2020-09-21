new Vue({
    el: '#app',
    data: {
        chart: null,
        tickers: [],
        ticker: {},
        columns: [],
        data: {}
    },
    created: function() {
        this.loadTickers()
    },
    methods: {
        initChart: function() {
            this.chart = anychart.stock()
            this.chart.container('chart_container').draw()
        },
        loadTickers: function() {
            let _this = this
            fetch('http://3.125.122.3:5000/api/get_tickers')
                .then(r => r.json())
                .then(data => {
                    _this.tickers = data
                    _this.loadTicker(_this.tickers[0])
                })
        },
        loadTicker: function(t) {
            let _this = this
            _this.ticker = t
            fetch(
                    `http://3.125.122.3:5000/api/get_data/${t.ticker}/1_day/${t.start_date}/${t.end_date}`
                )
                .then(r => r.json())
                .then(data => {
                    _this.data = anychart.data.table('date')
                    _this.data.addData(data.data)


                    _this.columns = []
                    for (const key in data.data[0]) {
                        if (key != 'ticker' && key !=
                            'timeframe' && key != 'date') {
                            _this.columns.push(key)
                        }
                    }

                    _this.drawCharts()
                })
        },
        drawCharts: function() {

            this.initChart()
            this.drawCandlestick()
            for (var i = 0; i < 3; i++) {
                this.drawLinechart()
            }

        },
        drawCandlestick: function() {
            var mapping = this.data.mapAs({
                open: "first_price",
                high: "max_price",
                low: "min_price",
                close: "last_price"
            })
            var series = this.chart.plot(0).candlestick(mapping)
            series.name(this.ticker.ticker)
        },
        drawLinechart: function() {
            let plotNumber = this.chart.getPlotsCount()
            for (let i = 0; i < this.columns.length; i++) {
                let key = this.columns[i]
                var mapping_1 = this.data.mapAs({
                    value: key
                });
                var line_1 = this.chart.plot(plotNumber).line(mapping_1);
                line_1.enabled(false)
                line_1.name(key)
            }
        }

    }

})
