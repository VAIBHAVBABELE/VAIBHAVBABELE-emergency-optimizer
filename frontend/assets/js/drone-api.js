class DroneService {
    static async getAll() {
        const response = await fetch('/backend/api/drone.php', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }

    static async dispatch(droneId, disasterId, payload) {
        const response = await fetch('/backend/api/drone.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                drone_id: droneId,
                disaster_id: disasterId,
                payload: payload
            })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }

    static async recall(droneId) {
        const response = await fetch(`/backend/api/drone.php?id=${droneId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                status: 'available',
                current_location: 'returning'
            })
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
}