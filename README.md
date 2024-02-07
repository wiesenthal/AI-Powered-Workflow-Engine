# Workflow Engine

An system to execute tasks and steps defined in a declarative JSON-based language.

Frontend Repo: https://github.com/wiesenthal/workflow-engine-frontend/tree/main

## Demo


https://github.com/wiesenthal/workflow-engine/assets/26258920/aa42a02b-a74a-4326-b189-bd22b127c8a7

(Sorry about low quality - GitHub filesize limit)  
Also note the API key is no longer valid


## AI Step Executor Generation
If a step name is unrecognized, my workflow engine will generate a novel function to execute this type of step using AI, or access a library of previously generated steps.

NOTE: Evaluating AI generated code is implemented in an unsafe way. Making this code execution in a production-capable way was out of scope.

It worked better than I expected, from the folllowing workflow, it was able to generate two steps, one that cast the input to a number, and one to make an http request returning the first n characters. 
```json
"steps": [
    {
        "cast_number": "@{num_chars}"
    },
    {
        "http_request_fetch": {
            "url": "https://httpbin.org/",
            "method": "GET",
            "num_chars_to_return": "${0}"
        }
    }
]
```

### Future Possibilities
Implement AI task decomposition into steps given a library of steps.

User authentication and storing their generated steps or custom workflows privately.

## Workflow Editing

I also implemented the ability to edit workflows for much needed flexibility. Note that this does change the backend storage of the workflow.   
If this were to be implemented in a multi-user production setting these custom workflows would be specific to the user, rather than global.

## Pre-Requisites
node=18.16.1
npm=9.5.1

## Setup

Create a .env file with the following keys:  
```sh
DEV_LOG=0 # Or 1 to turn on verbose logging  

AI_ENABLED=1 # Or 0 to turn off AI generation 

OPENAI_API_KEY=<Your OpenAI API Key>

CHAT_COMPLETION_MODEL=gpt-3.5-turbo # Or gpt-4 or gpt-4-1106-preview
# I have found it works best with gpt-3.5-turbo
```

Run  
`$npm install`  
`$npm start`

Go to localhost:5001
