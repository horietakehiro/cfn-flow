deploy:
	sam build
	sam deploy

destroy:
	sam delete --no-prompts

test:
	pytest --cov=functions/ --cov-report=html -v  ./functions/

test-templates:
	pytest --cov=functions/ --cov-report=html -v  ./functions/templates/

test-flows:
	pytest --cov=functions/ --cov-report=html -v  ./functions/flows/
