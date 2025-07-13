# CUCUMBER TAGS
CUCUMBER_TAGS='@scEighteen'
TWEETS_COUNT=120
SET_WDIO_LOG_LEVEL=error

# Host name
DOCKER_HOSTNAME=192.168.0.107:4444
LOCAL_HOSTNAME=localhost

DOCKER_BROWSER=docker
CHROME_BROWSER_GUI=chrome
CHROME_BROWSER_HEADLESS=headless

RUN_REPORTS_CHECKER=node --loader ts-node/esm reportsChecker.mts
RUN_REMOTE_BROWSER=export BROWSER_NAME=$(DOCKER_BROWSER) && export HOST_NAME=$(DOCKER_HOSTNAME) && export CUCUMBER_TAGS_EXPRESSION=$(CUCUMBER_TAGS) && export TWEETS_COUNTS_REQUEST=$(TWEETS_COUNT) && export WDIO_LOG_LEVEL=$(SET_WDIO_LOG_LEVEL)
RUN_CHROME_BROWSER_GUI=export BROWSER_NAME=$(CHROME_BROWSER_GUI) && export HOST_NAME=$(LOCAL_HOSTNAME) && export CUCUMBER_TAGS_EXPRESSION=$(CUCUMBER_TAGS) && export TWEETS_COUNTS_REQUEST=$(TWEETS_COUNT) && export WDIO_LOG_LEVEL=$(SET_WDIO_LOG_LEVEL)
RUN_CHROME_BROWSER_HEADLESS=export BROWSER_NAME=$(CHROME_BROWSER_HEADLESS) && export HOST_NAME=$(LOCAL_HOSTNAME) && export CUCUMBER_TAGS_EXPRESSION=$(CUCUMBER_TAGS) && export TWEETS_COUNTS_REQUEST=$(TWEETS_COUNT) && export WDIO_LOG_LEVEL=$(SET_WDIO_LOG_LEVEL)

# Running tests on docker containers
docker:
	$(MAKE) rename && $(RUN_REMOTE_BROWSER) && yarn test

# Running tests on local chrome GUI
chrome:
	$(RUN_CHROME_BROWSER_GUI) && yarn test

# Running tests on local chrome headless
headless:
	$(RUN_CHROME_BROWSER_HEADLESS) && yarn test

json-check:
	$(RUN_REPORTS_CHECKER)
rename:
	@DIR="reporter"; \
	EXTENSIONS="json csv"; \
	for EXT in $$EXTENSIONS; do \
	  ORIGINAL="$$DIR/tweets.$$EXT"; \
	  BASENAME="tweets-backup"; \
	  SUFFIX=".$$EXT"; \
	  if [ -f "$$ORIGINAL" ]; then \
	    index=1; \
	    while [ -f "$$DIR/$${BASENAME}[$$index]$$SUFFIX" ]; do \
	      index=$$((index + 1)); \
	    done; \
	    NEWNAME="$$DIR/$${BASENAME}[$$index]$$SUFFIX"; \
	    mv "$$ORIGINAL" "$$NEWNAME"; \
	    echo "File $$ORIGINAL berhasil di-rename menjadi $$NEWNAME."; \
	  else \
	    echo "File $$ORIGINAL tidak ditemukan. Lewat."; \
	  fi; \
	done