import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ReleaseForm } from './components/ReleaseForm';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { MyReleases } from './components/MyReleases';
import { AdminDashboard } from './components/AdminDashboard';
import { Payouts } from './components/Payouts';
import { Sidebar } from './components/Sidebar';
import { UserProfile } from './components/UserProfile';
import { Artists } from './components/Artists';
import { Cards } from './components/Cards';
import { Tracks } from './components/Tracks';
import { Insights } from './components/Insights';
import { Tickets } from './components/Tickets';
import { Release, View, User, ReleaseStatus, Artist, Ticket, TicketMessage } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.LANDING);
  const [currentRelease, setCurrentRelease] = useState<Release | null>(null);
  const [releaseToEdit, setReleaseToEdit] = useState<Release | null>(null);
  
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('scf_users');
      return savedUsers ? JSON.parse(savedUsers) : [];
    } catch (e) {
      console.error("Could not parse users from localStorage", e);
      return [];
    }
  });

  const [releases, setReleases] = useState<Release[]>(() => {
    try {
      const savedReleases = localStorage.getItem('scf_releases');
      let parsedReleases = savedReleases ? JSON.parse(savedReleases) : [];
      
      // Data Migration
      parsedReleases = parsedReleases.map((r: any) => {
        const history = r.statusHistory ? [...r.statusHistory] : [];
        
        // Ensure statusHistory exists
        if (history.length === 0) {
             // Add initial pending entry if missing
             history.push({
                 status: ReleaseStatus.PENDING_APPROVAL,
                 date: r.releaseDate || new Date().toISOString(),
                 note: 'Submission created'
             });
             
             // If currently approved or rejected, add that entry
             if (r.status !== ReleaseStatus.PENDING_APPROVAL) {
                 history.push({
                     status: r.status,
                     date: r.statusUpdateDate || new Date().toISOString(),
                     note: `Status updated to ${r.status}`
                 });
             }
        }

        // Backfill submissionDate if missing
        if (!r.submissionDate) {
            // Use the date of the first history entry if available
            r.submissionDate = history.length > 0 ? history[0].date : (r.releaseDate || new Date().toISOString());
        }

        return { ...r, statusHistory: history, submissionDate: r.submissionDate };
      });

      return parsedReleases;
    } catch (e) {
      console.error("Could not parse releases from localStorage", e);
      return [];
    }
  });

  const [artists, setArtists] = useState<Artist[]>(() => {
      try {
          const savedArtists = localStorage.getItem('scf_artists');
          return savedArtists ? JSON.parse(savedArtists) : [];
      } catch (e) {
          console.error("Could not parse artists from localStorage", e);
          return [];
      }
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const savedTickets = localStorage.getItem('scf_tickets');
      let parsedTickets = savedTickets ? JSON.parse(savedTickets) : [];
      // Data Migration: Ensure read flags exist
      parsedTickets = parsedTickets.map((t: any) => ({
          ...t,
          readByArtist: t.readByArtist ?? true,
          readByAdmin: t.readByAdmin ?? true
      }));
      return parsedTickets;
    } catch (e) {
      console.error("Could not parse tickets from localStorage", e);
      return [];
    }
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Ensure admin user exists for demonstration
    const adminExists = users.some(u => u.email === 'admin@scfmusic.com');
    if (!adminExists) {
        const adminUser: User = {
            id: 'admin_user_01',
            name: 'SCF Admin',
            email: 'admin@scfmusic.com',
            password: 'admin123', // DEMO ONLY
            role: 'admin',
        };
        setUsers(prev => [...prev, adminUser]);
    }
  }, [users]);

  useEffect(() => {
    localStorage.setItem('scf_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    // File objects are not serializable, so we store metadata only.
    const releasesToSave = releases.map(({ audioFile, ...rest }) => rest);
    localStorage.setItem('scf_releases', JSON.stringify(releasesToSave));
  }, [releases]);

  useEffect(() => {
      localStorage.setItem('scf_artists', JSON.stringify(artists));
  }, [artists]);

  useEffect(() => {
    localStorage.setItem('scf_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const handleStartRelease = () => {
    if (isAuthenticated) {
        setReleaseToEdit(null);
        setView(View.FORM);
    } else {
        setView(View.LOGIN);
    }
  };

  const handleEditRelease = (release: Release) => {
      setReleaseToEdit(release);
      setView(View.FORM);
  };

  const handleReleaseSubmit = (releaseData: Omit<Release, 'id' | 'userId' | 'status'>) => {
    if (!currentUser) return;
    const now = new Date().toISOString();

    if (releaseToEdit) {
        // Updating existing release
        setReleases(prev => prev.map(r => {
            if (r.id === releaseToEdit.id) {
                // If the form provided a new audio file, use it. Otherwise keep the existing one.
                const updatedAudioFile = releaseData.audioFile ? releaseData.audioFile : r.audioFile;

                return {
                    ...r,
                    ...releaseData,
                    audioFile: updatedAudioFile,
                    // If status was REJECTED, reset to PENDING_APPROVAL on edit. 
                    // If APPROVED, usually we don't allow major edits, but for this demo we'll reset to PENDING if changed.
                    // Let's reset to PENDING_APPROVAL to trigger re-review.
                    status: ReleaseStatus.PENDING_APPROVAL,
                    statusHistory: [
                        ...(r.statusHistory || []),
                        {
                            status: ReleaseStatus.PENDING_APPROVAL,
                            date: now,
                            note: 'Release updated by artist. Pending re-review.'
                        }
                    ]
                };
            }
            return r;
        }));
        setReleaseToEdit(null);
    } else {
        // Creating new release
        const newRelease: Release = {
            ...releaseData,
            id: `release_${Date.now()}`,
            userId: currentUser.id,
            submissionDate: now,
            status: ReleaseStatus.PENDING_APPROVAL,
            streams: 0,
            revenue: 0,
            statusHistory: [
                {
                    status: ReleaseStatus.PENDING_APPROVAL,
                    date: now,
                    note: 'Submission received and pending review.'
                }
            ]
        };
        setReleases(prev => [...prev, newRelease]);
    }
    setView(View.MY_RELEASES);
  };
  
  const handleGoHome = () => {
    setCurrentRelease(null);
    setReleaseToEdit(null);
    if (isAuthenticated) {
        setView(View.PROFILE);
    } else {
        setView(View.LANDING);
    }
  }

  const handleLogin = async (email: string, password: string): Promise<void> => {
    const user = users.find(u => u.email === email);
    if (user && user.password === password) { // NOTE: Plain text password for demo only
      if (user.isBanned) {
          throw new Error("This account has been suspended.");
      }
      setCurrentUser(user);
      setView(View.PROFILE); // Redirect to Profile Dashboard on login
    } else {
      throw new Error("Invalid email or password.");
    }
  };
  
  const handleRegister = async (name: string, email: string, password: string): Promise<void> => {
    if (users.some(u => u.email === email)) {
      throw new Error("An account with this email already exists.");
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      role: 'artist',
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    setView(View.PROFILE);
  };
  
  const handleLogout = () => {
      setCurrentUser(null);
      setReleaseToEdit(null);
      setView(View.LOGIN);
  }

  const handleViewDashboard = (release: Release) => {
    setCurrentRelease(release);
    setView(View.DASHBOARD);
  }

  const handleApproveRelease = (releaseId: string) => {
    setReleases(releases.map(r => {
        if (r.id === releaseId) {
            const now = new Date().toISOString();
            return { 
                ...r, 
                status: ReleaseStatus.APPROVED, 
                statusUpdateDate: now,
                statusHistory: [
                    ...(r.statusHistory || []),
                    {
                        status: ReleaseStatus.APPROVED,
                        date: now,
                        note: 'Your release has been approved and is being distributed.'
                    }
                ]
            };
        }
        return r;
    }));
  }

  const handleRejectRelease = (releaseId: string) => {
    setReleases(releases.map(r => {
        if (r.id === releaseId) {
            const now = new Date().toISOString();
            return { 
                ...r, 
                status: ReleaseStatus.REJECTED, 
                statusUpdateDate: now,
                statusHistory: [
                    ...(r.statusHistory || []),
                    {
                        status: ReleaseStatus.REJECTED,
                        date: now,
                        note: 'Your release was rejected. Please check guidelines.'
                    }
                ]
            };
        }
        return r;
    }));
  }

  const handleUpdateFinancials = (releaseId: string, streams: number, revenue: number) => {
    setReleases(prevReleases => 
        prevReleases.map(r => 
            r.id === releaseId ? { ...r, streams, revenue } : r
        )
    );
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleBanUser = (userId: string) => {
      setUsers(prevUsers => prevUsers.map(u => {
          if (u.id === userId && u.role !== 'admin') {
              return { ...u, isBanned: !u.isBanned };
          }
          return u;
      }));
  };

  const handleAddArtist = (newArtist: Omit<Artist, 'id'>) => {
      const artist: Artist = {
          ...newArtist,
          id: `artist_${Date.now()}`
      };
      setArtists([...artists, artist]);
  };

  const handleDeleteArtist = (id: string) => {
      setArtists(artists.filter(a => a.id !== id));
  };

  // Ticket Handlers
  const handleCreateTicket = (subject: string, category: string, initialMessage: string) => {
      if (!currentUser) return;
      const now = new Date().toISOString();
      const newTicket: Ticket = {
          id: `T-${Math.floor(Math.random() * 90000) + 10000}`,
          userId: currentUser.id,
          userName: currentUser.name,
          subject,
          category,
          status: 'Open',
          lastUpdated: now,
          messages: [
              {
                  id: `msg_${Date.now()}`,
                  senderId: currentUser.id,
                  senderName: currentUser.name,
                  text: initialMessage,
                  date: now,
                  isAdmin: currentUser.role === 'admin'
              }
          ],
          readByArtist: true,
          readByAdmin: false
      };
      setTickets([newTicket, ...tickets]);
  };

  const handleReplyTicket = (ticketId: string, text: string) => {
      if (!currentUser) return;
      const isAdminReply = currentUser.role === 'admin';
      
      setTickets(prevTickets => prevTickets.map(t => {
          if (t.id === ticketId) {
              const newMessage: TicketMessage = {
                  id: `msg_${Date.now()}`,
                  senderId: currentUser.id,
                  senderName: currentUser.name,
                  text,
                  date: new Date().toISOString(),
                  isAdmin: isAdminReply
              };
              return {
                  ...t,
                  lastUpdated: newMessage.date,
                  status: isAdminReply ? 'Resolved' : 'Open', // Auto resolve if admin replies, reopen if user replies
                  messages: [...t.messages, newMessage],
                  readByArtist: isAdminReply ? false : true, // If admin replies, artist hasn't read it
                  readByAdmin: isAdminReply ? true : false   // If artist replies, admin hasn't read it
              };
          }
          return t;
      }));
  };

  const handleUpdateTicketStatus = (ticketId: string, status: 'Open' | 'Closed' | 'Resolved') => {
      setTickets(prevTickets => prevTickets.map(t => 
          t.id === ticketId ? { ...t, status, lastUpdated: new Date().toISOString() } : t
      ));
  };
  
  const handleMarkTicketAsRead = (ticketId: string) => {
      if (!currentUser) return;
      const isAdmin = currentUser.role === 'admin';
      
      setTickets(prevTickets => prevTickets.map(t => {
          if (t.id === ticketId) {
             // Only update if currently unread for this user type
             if (isAdmin && !t.readByAdmin) {
                 return { ...t, readByAdmin: true };
             }
             if (!isAdmin && !t.readByArtist) {
                 return { ...t, readByArtist: true };
             }
          }
          return t;
      }));
  };

  // Render logic for Authenticated Users (Sidebar Layout)
  if (isAuthenticated && currentUser) {
      const renderAuthView = () => {
          switch(view) {
              case View.PROFILE:
              case View.LANDING: // Redirect landing to profile if logged in
                  return <UserProfile 
                            currentUser={currentUser} 
                            releases={releases.filter(r => r.userId === currentUser.id)} 
                            onCreateRelease={handleStartRelease} 
                            onViewRelease={handleViewDashboard}
                        />;
              case View.FORM:
                  return <ReleaseForm 
                            onSubmit={handleReleaseSubmit} 
                            existingArtists={artists} 
                            releaseToEdit={releaseToEdit}
                         />;
              case View.ARTISTS:
                  return <Artists artists={artists} onAddArtist={handleAddArtist} onDeleteArtist={handleDeleteArtist} />
              case View.CARDS:
                  return <Cards userId={currentUser.id} />
              case View.TRACKS:
                   return <Tracks releases={releases.filter(r => r.userId === currentUser.id)} />
              case View.INSIGHTS:
                   return <Insights releases={releases.filter(r => r.userId === currentUser.id)} />
              case View.TICKETS:
                   return <Tickets 
                            tickets={tickets.filter(t => t.userId === currentUser.id)} 
                            onCreateTicket={handleCreateTicket}
                            onReplyTicket={handleReplyTicket}
                            onMarkAsRead={handleMarkTicketAsRead}
                            currentUser={currentUser}
                          />
              case View.DASHBOARD:
                  return currentRelease && currentRelease.status === ReleaseStatus.APPROVED 
                      ? <Dashboard release={currentRelease} onBackToReleases={() => setView(View.MY_RELEASES)} /> 
                      : <MyReleases 
                          releases={releases.filter(r => r.userId === currentUser?.id)} 
                          onViewDashboard={handleViewDashboard} 
                          onEditRelease={handleEditRelease}
                        />;
              case View.MY_RELEASES:
                   return <MyReleases 
                            releases={releases.filter(r => r.userId === currentUser?.id)} 
                            onViewDashboard={handleViewDashboard} 
                            onEditRelease={handleEditRelease}
                          />;
              case View.PAYOUTS:
                  return <Payouts releases={releases.filter(r => r.userId === currentUser?.id && r.status === ReleaseStatus.APPROVED)} />
              case View.ADMIN:
                   return isAdmin 
                      ? <AdminDashboard 
                            releases={releases}
                            users={users}
                            tickets={tickets}
                            onApprove={handleApproveRelease} 
                            onReject={handleRejectRelease} 
                            onUpdateFinancials={handleUpdateFinancials}
                            onUpdateUser={handleUpdateUser}
                            onReplyTicket={handleReplyTicket}
                            onUpdateTicketStatus={handleUpdateTicketStatus}
                            onMarkAsRead={handleMarkTicketAsRead}
                            onBanUser={handleBanUser}
                        />
                      : <h2 className="text-center text-red-500 mt-10">Access Denied</h2>;
              default:
                  return <UserProfile 
                            currentUser={currentUser} 
                            releases={releases.filter(r => r.userId === currentUser.id)} 
                            onCreateRelease={handleStartRelease} 
                            onViewRelease={handleViewDashboard}
                        />;
          }
      }

      return (
          <div className="flex min-h-screen bg-slate-950">
              <Sidebar 
                currentUser={currentUser} 
                currentView={view} 
                onChangeView={(v) => {
                    // Reset edit state when navigating away
                    if (v !== View.FORM) setReleaseToEdit(null);
                    setView(v);
                }} 
                onLogout={handleLogout}
                tickets={tickets} 
                onCreateRelease={handleStartRelease}
              />
              <main className="flex-1 ml-64 p-8 overflow-y-auto">
                  <div key={view} className="animate-fadeIn">
                    {renderAuthView()}
                  </div>
              </main>
          </div>
      )
  }

  // Render logic for Public/Guest Users (Landing Layout)
  const renderGuestView = () => {
      switch(view) {
          case View.LOGIN:
              return <Login onLogin={handleLogin} onSwitchToRegister={() => setView(View.REGISTER)} />;
          case View.REGISTER:
              return <Register onRegister={handleRegister} onSwitchToLogin={() => setView(View.LOGIN)} />;
          default:
              return <Hero onStartRelease={handleStartRelease} />;
      }
  }

  return (
    <div className="min-h-screen font-sans">
      <Header 
        onGoHome={handleGoHome} 
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLoginClick={() => setView(View.LOGIN)}
        onLogout={handleLogout}
        onMyReleasesClick={() => setView(View.MY_RELEASES)}
        onAdminClick={() => setView(View.ADMIN)}
        onPayoutsClick={() => setView(View.PAYOUTS)}
      />
      <main className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <div key={view} className="animate-fadeIn">
            {renderGuestView()}
        </div>
      </main>
      <footer className="text-center py-8 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
        <p className="text-slate-400 mb-2">Contact us: <a href="mailto:scfmusic@musician.org" className="text-indigo-400 hover:text-indigo-300 transition-colors">scfmusic@musician.org</a></p>
        <p className="text-slate-600 text-sm">&copy; {new Date().getFullYear()} SCF Music. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;