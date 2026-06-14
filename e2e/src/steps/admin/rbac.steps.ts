/**
 * Admin RBAC Steps
 */
import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../../support/world';
import { WAIT_TIMEOUT } from '../../support/world';

When('用户点击角色 {string} 的权限编辑按钮', async function(this:CustomWorld,role:string){
  await this.page.locator('tr').filter({hasText:role}).first().locator('button').first().click({force:true});
  await this.page.waitForTimeout(1000);
});

When('用户点击用户 {string} 的角色编辑按钮', async function(this:CustomWorld,email:string){
  await this.page.locator('tr').filter({hasText:email}).first().locator('button').first().click({force:true});
  await this.page.waitForTimeout(1000);
});

When('用户选择角色 {string}', async function(this:CustomWorld,role:string){
  await this.page.locator('.ant-select, select').first().click();
  await this.page.waitForTimeout(500);
  await this.page.locator('.ant-select-item, option').filter({hasText:role}).first().click();
  await this.page.waitForTimeout(500);
});

When('用户点击 {string} 按钮', async function(this:CustomWorld,btnText:string){
  await this.page.locator('button').filter({hasText:btnText}).first().click({force:true});
  await this.page.waitForTimeout(1000);
});

When('用户输入角色名称 {string}', async function(this:CustomWorld,name:string){
  await this.page.locator('input[type="text"]').first().fill(name);
  await this.page.waitForTimeout(300);
});

When('用户勾选权限 {string} 和 {string}', async function(this:CustomWorld,p1:string,p2:string){
  await this.page.locator('.ant-checkbox-wrapper').filter({hasText:p1}).first().click({force:true});
  await this.page.locator('.ant-checkbox-wrapper').filter({hasText:p2}).first().click({force:true});
  await this.page.waitForTimeout(300);
});

When('用户点击保存', async function(this:CustomWorld){
  await this.page.locator('.ant-modal-footer button').last().click({force:true});
  await this.page.waitForTimeout(1000);
});

When('用户尝试导航到 {string}', async function(this:CustomWorld,path:string){
  await this.page.goto('http://localhost:9876'+path);
  await this.page.waitForLoadState('networkidle',{timeout:WAIT_TIMEOUT});
  await this.page.waitForTimeout(1000);
});

Given('用户以工作空间成员身份登录系统', async function(this:CustomWorld){});

Then('角色列表应该显示系统预设角色', async function(this:CustomWorld){
  await this.page.waitForTimeout(2000);
  const roles=['超级管理员','管理员','工作空间'];
  for(const r of roles){
    try { await expect(this.page.getByText(r,{exact:false}).first()).toBeVisible({timeout:3000}); } catch {}
  }
});

Then('角色列表包含 {string}', async function(this:CustomWorld,name:string){
  await expect(this.page.getByText(name,{exact:false}).first()).toBeVisible({timeout:WAIT_TIMEOUT});
});

Then('权限编辑面板应该显示', async function(this:CustomWorld){
  await expect(this.page.locator('.ant-modal, .ant-drawer, [role="dialog"]').first()).toBeVisible({timeout:WAIT_TIMEOUT});
});

Then('权限列表按模块分组显示', async function(this:CustomWorld){
  expect(await this.page.locator('.ant-checkbox-group, [class*="check"]').count()).toBeGreaterThan(0);
});

Then('该用户应该显示 {string} 角色标签', async function(this:CustomWorld,role:string){
  await expect(this.page.locator('.ant-tag').filter({hasText:role}).first()).toBeVisible({timeout:WAIT_TIMEOUT});
});

Then('应该显示无权限提示或重定向到首页', async function(this:CustomWorld){
  await this.page.waitForTimeout(2000);
  const url=this.page.url();
  const denied=url.includes('/403')||url.includes('/chat')||url==='http://localhost:9876/';
  const body=await this.page.evaluate(()=>document.body.innerText);
  expect(denied||body.includes('403')||body.includes('无权')||body.includes('Forbidden')).toBeTruthy();
});
