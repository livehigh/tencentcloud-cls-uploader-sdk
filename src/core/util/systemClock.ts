/**
 * 系统时间校准
 */
class SystemClock {
  // 当前时间与系统时间偏移量
  /**
   * 当前时间与系统时间偏移量
   */
  private offset = 0;

  /**
   * 获取时间偏移量
   */
  get systemClockOffset() {
    return this.offset;
  }

  /**
   * 获取当前系统时间
   * @returns
   */
  public now() {
    return Date.now() + (this.offset || 0);
  }

  public handleOffset(serverDate: string) {
    const serverTime = Date.parse(serverDate);
    // 本地时间与服务器时间相差大于等于30s则需要进行校准
    if (Math.abs(this.now() - serverTime) >= 30000) {
      this.offset = serverTime - Date.now();
    }
  }
}

export default new SystemClock();
