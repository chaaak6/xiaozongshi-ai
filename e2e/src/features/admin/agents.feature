@admin @journey @P1
Feature: 智能体统一管理
  作为管理员，我希望能够统一管理所有用户的智能体

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-AGENT-001 @P1
  Scenario: 查看智能体列表
    When 用户导航到管理后台智能体管理 "/admin/agents"
    Then 页面标题 "智能体管理" 应该可见
    And 表格中应该包含智能体 "代码助手"

  @ADMIN-AGENT-002 @P1
  Scenario: 启用/禁用智能体
    When 用户导航到管理后台智能体管理 "/admin/agents"
    And 用户点击智能体 "数据分析师" 的启用开关
    Then 应该显示成功提示 "智能体状态已更新"
