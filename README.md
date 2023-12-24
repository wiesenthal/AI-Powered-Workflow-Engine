# Miles' Ought Developer Takehome

I implemented all steps of the Ought Developer Takehome assignment.
The styling should be familiar.

## AI Step Executor Generation
If a step name is unrecognized, my workflow engine will generate a novel function to execute this type of step using AI, or access a library of previously generated steps.

NOTE: Evaluating AI generated code is implemented in an unsafe way. Making this code execution in a production-capable way was out of scope.

### Future Possibilities
Implement AI task decomposition into steps given a library of steps.

User authentication and storing their generated steps or custom workflows privately.

## Pre-Requisites
node=18.16.1
npm=9.5.1

## Setup

Create a .env file with the following keys:  
```
DEV_LOG=0 # Or 1 to turn on verbose logging  

AI_ENABLED=1 # Or 0 to turn off AI generation 

OPENAI_API_KEY=<Your OpenAI API Key>

CHAT_COMPLETION_MODEL=gpt-3.5-turbo # Or gpt-4 or gpt-4-1106-preview
# I have found it works well with gpt-3.5-turbo
```

`npm install`  
`npm start`

Go to localhost:5001
