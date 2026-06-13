@admin @journey @smoke @P0
Feature: 管理后台仪表盘
  作为管理员，我希望能够在仪表盘查看系统统计数据

  Background:
    Given 用户以管理员身份登录系统

  @ADMIN-DASH-001 @P0
  Scenario: 访问管理员仪表盘并查看统计数据
    When 用户导航到管理后台首页 "/admin"
    Then 仪表盘标题 "仪表盘" 应该可见
    And 统计卡片 "总用户数" 应该显示
    And 统计卡片 "总会话数" 应该显示
    And 统计卡片 "总消息数" 应该显示

  @ADMIN-DASH-002 @P0
  Scenario: 仪表盘侧边栏导航可见
    When 用户导航到管理后台首页 "/admin"
    Then 侧边栏菜单 "仪表盘" 应该可见
    And 侧边栏菜单 "会话存档" 应该可见
    And 侧边栏菜单 "智能体管理" 应该可见
    And 侧边栏菜单 "插件管理" 应该可见
    And 侧边栏菜单 "知识库管理" 应该可见
    And 侧边栏菜单 "用户管理" 应该可见
    And 侧边栏菜单 "权限管理" 应该可见

  @ADMIN-DASH-003 @P0
  Scenario: 非管理员用户无法访问管理后台
    When 用户以普通成员身份登录系统
    And 用户尝试导航到管理后台 "/admin"
    Then 用户应该被重定向到聊天页面 "/chat"
