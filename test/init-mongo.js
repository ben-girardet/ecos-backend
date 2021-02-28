db.createUser(
    {
        user: "admin",
        pwd: "admin-test-pwd",
        roles: [
            {
                role: "readWrite",
                db: "ecostest"
            }
        ]
    }
)
