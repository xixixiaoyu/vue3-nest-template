"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUser = formatUser;
exports.formatUsers = formatUsers;
/**
 * 格式化单个用户数据
 * 将 Prisma 的 Date 类型转换为 ISO 字符串
 */
function formatUser(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}
/**
 * 格式化用户列表
 */
function formatUsers(users) {
    return users.map(formatUser);
}
//# sourceMappingURL=user.utils.js.map