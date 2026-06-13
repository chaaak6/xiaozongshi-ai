@admin @journey @P2
Feature: RBAC 权限管理
  作为管理员，我希望能够管理角色和权限分配

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-RBAC-001 @P2
  Scenario: 查看角色列表
    When 用户导航到管理后台权限管理 "/admin/rbac"
    Then 页面标题 "权限管理" 应该可见
    And 角色列表应该显示 "超级管理员"
    And 角色列表应该显示 "管理员"

  @ADMIN-RBAC-002 @P2
  Scenario: 打开角色权限编辑弹窗
    When 用户导航到管理后台权限管理 "/admin/rbac"
    And 用户点击角色 "管理员" 的权限配置按钮
    Then 权限编辑弹窗应该显示
    And 弹窗应该包含权限选项 "admin:access"
