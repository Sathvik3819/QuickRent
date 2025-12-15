import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import { motion } from 'framer-motion';
import img from '../assets/LandingPageImg.png';
import { NavLink } from 'react-router';
import img2 from '../assets/innova.png';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingForm from '../components/BookingForm';
import { useDispatch } from 'react-redux';
import { clearFilters } from '../redux/slices/carsSlice';

const LandingPage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(clearFilters());
    }, [dispatch]);
    // --- DATA ---
    const cars = [
        {
            id: 1,
            name: 'Hyundai Grand i10',
            price: '₹1,200',
            tags: ['Petrol', 'Manual', '5 Seats'],
            img: 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/110355/grand-i10-nios-exterior-right-front-three-quarter-4.jpeg'
        },
        {
            id: 2,
            name: 'Tata Altroz',
            price: '₹1,400',
            tags: ['Diesel', 'Manual', '5 Seats'],
            img: 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/32597/altroz-exterior-right-front-three-quarter-79.jpeg'
        },
        {
            id: 3,
            name: 'Volkswagen Polo',
            price: '₹1,600',
            tags: ['Petrol', 'Auto', '5 Seats'],
            img: 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/29628/polo-exterior-right-front-three-quarter-2.jpeg'
        }
    ];

    const features = [
        { icon: '🛡️', title: 'Fully Insured', desc: 'Drive with peace of mind. Every trip is covered.' },
        { icon: '💸', title: 'No Hidden Charges', desc: 'Prices include taxes and insurance upfront.' },
        { icon: '🧼', title: 'Hygiene First', desc: 'Deeply cleaned and sanitized before every delivery.' }
    ];

    // --- ANIMATION VARIANTS ---
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.8 }
        }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: "easeOut" }
        }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: "easeOut" }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const scaleIn = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    // --- STYLES (Inline CSS) ---
    const styles = {
        primaryText: { color: '#ea580c' },
        bgLight: { backgroundColor: '#f5f5f5ff' },
        heroSection: {
            minHeight: '85vh',
            display: 'flex',
            alignItems: 'center'
        },
        btnPrimary: {
            backgroundColor: '#ea580c',
            borderColor: '#ea580c',
            fontWeight: '700',
            padding: '10px 20px'
        },
        navLink: { fontWeight: '500', color: '#1f2937' },
        cardHover: { transition: 'transform 0.3s', cursor: 'pointer' },
        footer: { backgroundColor: '#111827', color: '#9ca3af' },
    };

    return (
        <div>



            {/* --- HERO SECTION --- */}
            <section style={styles.heroSection} className="container-fluid px-5 py-5">
                <div className="row align-items-center w-100 m-0">

                    {/* Left Content */}
                    <motion.div
                        className="col-lg-7 text-center text-lg-start mb-5 mb-lg-0"
                        initial="hidden"
                        animate="visible"
                        variants={slideInLeft}
                    >
                        <h1 className="display-3 fw-bold lh-1 text-dark mb-3">
                            Budget Friendly.<br />
                            <span style={styles.primaryText}>Car Ready.</span>
                        </h1>
                        <p className="lead text-secondary mb-4" style={{ maxWidth: '500px' }}>
                            Rent clean, reliable cars like the i10, Tata Punch, or Swift for your daily needs. Transparent pricing, zero hidden fees.
                        </p>
                        <img
                            src={img}
                            alt="Family Car"
                            className="img-fluid"
                            style={{ maxHeight: '350px', }}
                        />
                    </motion.div>

                    {/* Right Form */}
                    <motion.div
                        className="col-lg-5 d-flex justify-content-center"
                        initial="hidden"
                        animate="visible"
                        variants={slideInRight}
                    >
                        <BookingForm />
                    </motion.div>
                </div>
            </section>

            {/* --- WHY CHOOSE US --- */}
            <motion.section
                className="container py-5 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
            >
                <div className="mb-5">
                    <h2 className="fw-bold">Why Drive with Us?</h2>
                    <p className="text-muted">We prioritize your comfort and wallet.</p>
                </div>
                <motion.div
                    className="row g-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            className="col-md-4"
                            key={index}
                            variants={scaleIn}
                            whileHover={{
                                scale: 1.05,
                                transition: { duration: 0.3 }
                            }}
                        >
                            <div className="p-4 border rounded-4 h-100" style={styles.bgLight}>
                                <div className="display-4 mb-3">{feature.icon}</div>
                                <h4 className="fw-bold h5">{feature.title}</h4>
                                <p className="text-muted small">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>



            {/* --- LIST YOUR CAR CTA --- */}
            <motion.section
                className="py-5"
                id="host"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeIn}
            >
                <div className="container py-4 px-4 border rounded-4" style={{ backgroundImage: 'linear-gradient(to right, #0038eeed, #92bfffff)' }} >
                    <div className="row align-items-center text-white"  >
                        <motion.div
                            className="col-md-8 text-center text-md-start mb-4 mb-md-0"
                            variants={slideInLeft}
                        >
                            <h2 className="fw-bold mb-3">Let Your Car Earn For You</h2>
                            <p className="lead opacity-75">
                                Monetize your vehicle effortlessly by listing it on CarRental.

                                We take care of insurance, driver verification and secure payments — so you can earn passive income, stress-free.
                            </p>

                            <NavLink to="/sign-up" className="btn btn-light text-primary">List your car</NavLink>
                        </motion.div>
                        <motion.div
                            className="col-md-4"
                            variants={slideInRight}
                        >
                            <img
                                src={img2}
                                alt="Car"
                                className="img-fluid"
                            />
                        </motion.div>
                    </div>
                </div>
            </motion.section>


        </div>
    );
};

export default LandingPage;