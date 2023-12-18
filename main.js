const { createApp } = Vue;
let app = createApp({
	data () {
		return {
			prefix: '08',
			numbers: [
				'88425029',
				'88299093',
				'88299093',
				'90933019',
				'92298463',
			]
		};
	},
	methods: {
		query (sortBy='positive', desc=true) {
			let self = this;
			let data = [];
			self.numbers.forEach(num => data.push(self.querySomJade(self.prefix + num)));
			if (desc) {
				data.sort((a, b) => a[sortBy] > b[sortBy] ? -1 : a[sortBy] < b[sortBy] ? 1 : 0)
			} else {
				data.sort((a, b) => a[sortBy] < b[sortBy] ? -1 : a[sortBy] > b[sortBy] ? 1 : 0)
			}
			return data;
		},
		querySomJade (phoneNumber) {
			let data = {
				'number': phoneNumber
			};

			jQuery.ajax({
				method: 'POST',
				async: false,
				url: 'https://somjade.com/ber/',
				contentType: 'application/x-www-form-urlencoded',
				data: {
					phone_number: phoneNumber,
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
					let predPoint = parseInt(div[12].innerText.trim());

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
	}
}).mount('#app');