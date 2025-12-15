import { NavLink } from "react-router";


export default function Footer() {

    const styles = {
        footer: {
            backgroundColor: '#111827',
            color: '#9ca3af',
        },
    };

    return (
        <footer style={styles.footer} className="pt-5 pb-3">
            <div className="container">
                <div className="row g-4 mb-5">
                    <div className="col-md-3">
                        <h5 className="text-white fw-bold mb-3">Quick<span style={styles.primaryText}>Rent</span></h5>
                        <p className="small opacity-75">Making premium mobility accessible to everyone. The journey matters.</p>
                    </div>

                    <div className="col-md-3">
                        <h6 className="text-white fw-bold mb-3">Contact</h6>
                        <ul className="list-unstyled small opacity-75">
                            <li className="mb-2">support@quickrent.com</li>
                            <li className="mb-2">+91 98765 43210</li>
                            <li className="mb-2">Hyderabad, India</li>
                        </ul>
                    </div>
                </div>
                <div className="text-center pt-4 border-top border-secondary border-opacity-25">
                    <small className="opacity-50">&copy; 2025 QuickRent. All rights reserved.</small>
                </div>
            </div>
        </footer>
    )
}