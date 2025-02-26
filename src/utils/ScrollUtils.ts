export function scrollTo(isToTop: boolean) {
    // 动画持续时间（毫秒），适当增加持续时间
    const duration = 60; 
    // 获取当前窗口的高度
    const windowHeight = window.innerHeight;
    // 获取当前页面的滚动位置
    const currentScroll = window.scrollY;
    const targetScroll = isToTop ? Math.max(0, currentScroll - windowHeight / 2) : currentScroll + windowHeight / 2;

    // 动画开始时间
    const startTime = performance.now();

    function scrollAnimation(currentTime: DOMHighResTimeStamp) {
        // 计算动画已经执行的时间
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
            // 使用缓动函数计算进度
            const progress = easeInOutCubic(elapsedTime / duration);
            const newScroll = currentScroll + (targetScroll - currentScroll) * progress;
            window.scrollTo(0, newScroll);
            // 请求下一帧动画
            requestAnimationFrame(scrollAnimation);
        } else {
            // 动画结束，滚动到目标位置
            window.scrollTo(0, targetScroll);
        }
    }

    // 开始动画
    requestAnimationFrame(scrollAnimation);
}

// 缓动函数：三次方缓动
function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}
