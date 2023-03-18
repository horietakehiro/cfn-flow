deploy:
	sam build
	sam deploy

destroy:
	sam delete --no-prompts

test:
	pytest

test-templates:
	pytest --cov=functions/ --cov-report=html -v  ./functions/templates/