const environment = jasmine.getEnv();

export function it(description, test) {

	environment.it(description, async done => {

		try {
			await test();
			done();	
		} catch(err) {
			done.fail(err);
		}

	});

}