import {test,expect} from '@playwright/test';
test('frontend workflow contract and live public summary before verification',async({request})=>{
 const workflow=await(await request.get('http://localhost:8000/api/projects/p_demo/workflow')).json();
 expect(workflow.project.mode).toBe('before');expect(workflow.scan.score).toBe(38);
 expect(workflow.capabilities.evidencePdf).toBe(false);expect(workflow.capabilities.reviewFixes).toBe(true);
 expect(workflow.subscription.enforced).toBe(false);
 const response=await request.get('http://localhost:8000/api/public/projects/chennai-organics/summary',{headers:{Origin:'http://localhost:5174'}});
 expect(response.headers()['access-control-allow-origin']).toBe('http://localhost:5174');
 expect(response.headers()['x-cryptiq-data-source']).toBe('live');
 const summary=await response.json();expect(summary.score).toBe(38);expect(summary.counts).toEqual({critical:3,high:2,medium:0,low:3});expect(summary.verified).toBe(false);
 const project=await(await request.post('http://localhost:8000/api/projects',{data:{name:'Frontend capability test'}})).json();
 const uploaded=await(await request.get(`http://localhost:8000/api/projects/${project.id}/workflow`)).json();
 expect(uploaded.scan).toBe(null);expect(uploaded.capabilities.dictionary).toBe(false);expect(uploaded.capabilities.verify).toBe(false);
 expect((await request.get('http://localhost:8000/api/projects/missing/workflow')).status()).toBe(404);
});
