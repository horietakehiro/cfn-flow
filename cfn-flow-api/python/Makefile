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

test-stacks:
	pytest --cov=functions/ --cov-report=html -v  ./functions/stacks/
test-plans:
	pytest --cov=functions/ --cov-report=html -v  ./functions/plans/

test-utilities:
	pytest --cov=functions/ --cov-report=html -v  ./functions/utilities/
