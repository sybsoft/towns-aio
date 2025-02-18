export class Account {
    constructor(
        id,
        email_username,
        email_password,
        last_bober_tapped_time,
        bober_tap_count,
        tawns_wallet_address,
        created_at,
        proxy,
        user_agent
    ) {
        this.id = id
        this.email_username = email_username
        this.email_password = email_password
        this.last_bober_tapped_time = last_bober_tapped_time
        this.bober_tap_count = bober_tap_count
        this.tawns_wallet_address = tawns_wallet_address
        this.created_at = created_at
        this.proxy = proxy
        this.user_agent = user_agent
    }
}

export const initAccountFromObject = (obj) => {
    return new Account(
        obj.id,
        obj.email_username,
        obj.email_password,
        obj.last_bober_tapped_time,
        obj.bober_tap_count,
        obj.tawns_wallet_address,
        obj.created_at,
        obj.proxy,
        obj.user_agent,
    )
}