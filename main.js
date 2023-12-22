const { createApp } = Vue;
let app = createApp({
	data () {
		return {
			content: '',
			prefix: '08',
			defaultLength: 8,
			numbers: [],
			results: [],
			loading: false
		};
	},
	methods: {
		parseNumber () {
			let self = this;
			let parsed = [];
			let nums = self.content.split(/[\p{P}\n\t]+/u);

			nums.forEach(num => {
				num = num.replace(' ', '');
				if (!isNaN(num) && num.length == self.defaultLength) {
					let numUi = num;
					let midIn = Math.floor(numUi.length / 2);
					parsed.push({
						'num': num,
						'numUi': numUi.slice(0, midIn) + " " + numUi.slice(midIn)
					});
				}
			});

			self.numbers = [...new Map(parsed.map(item => [item['num'], item])).values()];
		},
		query (sortBy = 'positive', desc = true) {
			let self = this;
			let data = [];

			self.loading = true;
			self.numbers.forEach(num => data.push(self.querySomJade(num.num)));

			if (desc) {
				data.sort((a, b) => a[sortBy] > b[sortBy] ? -1 : a[sortBy] < b[sortBy] ? 1 : 0);
			} else {
				data.sort((a, b) => a[sortBy] < b[sortBy] ? -1 : a[sortBy] > b[sortBy] ? 1 : 0);
			}

			self.results = data;
			setTimeout(() => self.loading = false, 1000);
			return data;
		},
		parseAndquery () {
			let self = this;
			self.parseNumber();
			self.query();
		},
		querySomJade (phoneNumber) {
			let self = this;
			let numUi = phoneNumber;
			let midIn = Math.floor(numUi.length / 2);

			let data = {
				'number': phoneNumber,
				'numUi': numUi.slice(0, midIn) + " " + numUi.slice(midIn)
			};

			jQuery.ajax({
				method: 'POST',
				async: false,
				url: 'https://somjade.com/ber/',
				contentType: 'application/x-www-form-urlencoded',
				data: {
					phone_number: self.prefix + phoneNumber,
					submit: 'ทำนายเบอร์โทร'
				},
				success: (jqXHR, textStatus) => {
					let body = $.parseHTML(jqXHR);
					let div = $(body).find('div');
					let p = $(div[8]).find('p');
					let text = p[0].innerText;
					let vals = [];
					text.split(' ').forEach(t => {
						let val = parseInt(t);
						if (val) {
							vals.push(val);
						}
					});
					let posPoint = vals[0];
					let negPoint = vals[1];
					let predPoint = div[12].innerText.trim();

					negPoint = negPoint ? negPoint : 0;

					data['status'] = textStatus;
					data['positive'] = posPoint;
					data['negative'] = negPoint;
					data['predict'] = predPoint;
				},
				error: (jqXHR, textStatus, errorThrown) => {
					data['status'] = textStatus;
					data['response'] = jqXHR;
					data['error'] = errorThrown;
				}
			});

			return data;
		}
	},
	mounted () {

	}
}).mount('#app');