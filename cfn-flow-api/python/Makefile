deploy:
	sam build
	sam deploy

test:
	pytest

test-templates:
	pytest --cov=functions/ --cov-report=html -v  ./functions/templates/