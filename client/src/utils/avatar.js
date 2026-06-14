export const getAvatarUrl = (avatar) => {
  if (!avatar || avatar === 'default-avatar.png') {
    return '/default-avatar.svg';
  }

  if (/^https?:\/\//i.test(avatar)) {
    return avatar;
  }

  return `/uploads/avatars/${avatar}`;
};

