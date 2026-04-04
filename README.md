https://anthropic.skilljar.com/claude-code-in-action

Claude Code in Action

- Screenshot chat to implement FE
- Mode: 
    - memory mode
    - planning mode, thinking mode for harder task
- Rewinding Conversations
- Controlling context
- Custom command
- MCP iteration (playwright)
- Github integration:
    - /install-github-app
    - Screenshot and test button toggle inside Github (playwright)
- Hooks

Prompt
```
❯ your goal is too improve the component generation promt at   
@src/lib/prompts/generation.tsx . Here how:                    
1. Open a browser and navigate to localhost:3000               
2. Request a basic component to be generated                   
3. review the generated component and its source code          
4. Identify areas of improvement                               
5. update the promt to produce better component going forward  
                                                               
For now, only evaluate visual styling aspects. We dont want    
components generated that look lile typical tailwindcss        
components - we want something more original ```